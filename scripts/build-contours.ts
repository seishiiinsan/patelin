// Builds the map files from the commune contours of geo.api.gouv.fr (Licence Ouverte):
// - public/geo/communes/<department>.json: the communes of one department, simplified;
// - public/geo/departements.json: the 101 departments, with the DROM as insets.
// Only INSEE codes are kept: names stay out of the files so the map can't help a placement.
// Raw downloads are cached in .cache/contours. Usage: npm run data:contours
import "dotenv/config";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import mapshaper from "mapshaper";
import { insetFor, toInset, type LonLat } from "@/lib/drom-insets";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { forEachConcurrent } from "./lib/commons";
import { USER_AGENT } from "./lib/http";

const RAW_DIR = ".cache/contours";
const OUT_DIR = "public/geo";
// Simplification tolerance in meters: detailed enough to tell villages apart in a department
// view, coarse enough for the whole of France on one screen.
// 300 m keeps the largest department (Pas-de-Calais, 887 communes) under 300 kB.
const COMMUNE_INTERVAL_M = 300;
const DEPARTMENT_INTERVAL_M = 700;
const MAX_DEPARTMENT_FILE_BYTES = 300_000;

type Geometry = { type: "Polygon" | "MultiPolygon"; coordinates: unknown };
type FeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: Record<string, string>;
    geometry: Geometry;
  }[];
};

async function exists(file: string) {
  return stat(file).then(
    () => true,
    () => false,
  );
}

async function rawContours(code: string): Promise<string> {
  const file = path.join(RAW_DIR, `${code}.json`);
  if (await exists(file)) return readFile(file, "utf8");

  const url = `https://geo.api.gouv.fr/departements/${code}/communes?format=geojson&geometry=contour&fields=code`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  const text = await response.text();
  await writeFile(file, text);
  return text;
}

async function run(
  commands: string,
  input: Record<string, string>,
): Promise<string> {
  const output = await mapshaper.applyCommands(commands, input);
  return String(output["out.json"]);
}

// Moves every point of a DROM geometry into its inset on the France map.
function moveIntoInset(geometry: Geometry, code: string): Geometry {
  const inset = insetFor(code);
  if (!inset) return geometry;
  const round = (n: number) => Math.round(n * 1e4) / 1e4;
  const move = (coords: unknown): unknown =>
    typeof (coords as number[])[0] === "number"
      ? toInset(inset, coords as LonLat).map(round)
      : (coords as unknown[]).map(move);
  return { ...geometry, coordinates: move(geometry.coordinates) };
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(path.join(OUT_DIR, "communes"), { recursive: true });

  const departments = await prisma.department.findMany({
    select: { code: true },
    orderBy: { code: "asc" },
  });
  const outlines: Record<string, string> = {};
  const sizes: { code: string; bytes: number }[] = [];

  await forEachConcurrent(departments, 4, async ({ code }) => {
    const raw = await rawContours(code);
    const communes = await run(
      `-i raw.json -filter-fields code -simplify interval=${COMMUNE_INTERVAL_M} keep-shapes ` +
        `-o out.json format=geojson precision=0.0001`,
      { "raw.json": raw },
    );
    await writeFile(path.join(OUT_DIR, "communes", `${code}.json`), communes);
    sizes.push({ code, bytes: Buffer.byteLength(communes) });

    // Full-resolution outline, simplified later with its neighbours so shared borders match.
    outlines[`${code}.json`] = await run(
      `-i raw.json -each "dep='${code}'" -dissolve dep -rename-fields code=dep ` +
        `-o out.json format=geojson`,
      { "raw.json": raw },
    );
  });

  const files = Object.keys(outlines).sort().join(" ");
  const france = JSON.parse(
    await run(
      `-i ${files} combine-files -merge-layers -simplify interval=${DEPARTMENT_INTERVAL_M} keep-shapes ` +
        `-o out.json format=geojson precision=0.0001`,
      outlines,
    ),
  ) as FeatureCollection;
  for (const feature of france.features) {
    feature.geometry = moveIntoInset(
      feature.geometry,
      feature.properties.code!,
    );
  }
  const franceJson = JSON.stringify(france);
  await writeFile(path.join(OUT_DIR, "departements.json"), franceJson);

  sizes.sort((a, b) => b.bytes - a.bytes);
  const tooBig = sizes.filter((s) => s.bytes > MAX_DEPARTMENT_FILE_BYTES);
  logger.info(
    {
      departments: france.features.length,
      franceKb: Math.round(Buffer.byteLength(franceJson) / 1000),
      largestKb: sizes
        .slice(0, 3)
        .map((s) => `${s.code}: ${Math.round(s.bytes / 1000)}`),
      totalKb: Math.round(sizes.reduce((sum, s) => sum + s.bytes, 0) / 1000),
    },
    "contours written",
  );
  if (tooBig.length > 0) {
    logger.error(
      { departments: tooBig.map((s) => s.code) },
      "files over 300 kB",
    );
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "contour build failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
