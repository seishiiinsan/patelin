// Imports regions, departments and communes (métropole + DROM) from geo.api.gouv.fr.
// Safe to run again: rows are upserted, and communes missing from the source are deactivated.
// Usage: npm run data:communes
import "dotenv/config";
import { Prisma } from "@/generated/prisma/client";
import {
  isInPerimeter,
  toCommuneRow,
  type GeoApiCommune,
} from "@/lib/communes";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chunk, fetchJson } from "./lib/http";

const GEO_API = "https://geo.api.gouv.fr";

type GeoApiRegion = { code: string; nom: string; chefLieu: string };
type GeoApiDepartment = {
  code: string;
  nom: string;
  codeRegion: string;
  chefLieu: string;
};

async function main() {
  const [regions, departments, communes] = await Promise.all([
    fetchJson<GeoApiRegion[]>(`${GEO_API}/regions?fields=code,nom,chefLieu`),
    fetchJson<GeoApiDepartment[]>(
      `${GEO_API}/departements?fields=code,nom,codeRegion,chefLieu`,
    ),
    fetchJson<GeoApiCommune[]>(
      `${GEO_API}/communes?fields=code,nom,codeDepartement,codeRegion,population,surface,centre`,
    ),
  ]);

  const keptDepartments = departments.filter((d) => isInPerimeter(d.code));
  const keptRegionCodes = new Set(keptDepartments.map((d) => d.codeRegion));
  const keptRegions = regions.filter((r) => keptRegionCodes.has(r.code));
  const rows = communes.flatMap((c) => toCommuneRow(c) ?? []);
  logger.info(
    {
      regions: keptRegions.length,
      departments: keptDepartments.length,
      communes: rows.length,
    },
    "fetched from geo.api.gouv.fr",
  );

  // Every commune touched by this import gets this timestamp (millisecond precision, like the column).
  const importedAt = new Date();

  await prisma.$transaction(
    async (tx) => {
      for (const r of keptRegions) {
        await tx.region.upsert({
          where: { code: r.code },
          create: { code: r.code, name: r.nom, chefLieu: r.chefLieu },
          update: { name: r.nom, chefLieu: r.chefLieu },
        });
      }
      for (const d of keptDepartments) {
        const data = {
          name: d.nom,
          regionCode: d.codeRegion,
          chefLieu: d.chefLieu,
        };
        await tx.department.upsert({
          where: { code: d.code },
          create: { code: d.code, ...data },
          update: data,
        });
      }

      // One INSERT … ON CONFLICT per 1,000 communes instead of 35,000 upserts.
      for (const batch of chunk(rows, 1_000)) {
        const values = batch.map(
          (
            c,
          ) => Prisma.sql`(${c.inseeCode}, ${c.name}, ${c.searchName}, ${c.departmentCode}, ${c.regionCode},
            ${c.population}, ${c.surfaceHa}, ${c.latitude}, ${c.longitude}, ${c.radiusKm},
            ${c.tier}::"Tier", true, ${importedAt})`,
        );
        await tx.$executeRaw`
          INSERT INTO "Commune" ("inseeCode", "name", "searchName", "departmentCode", "regionCode", "population",
            "surfaceHa", "latitude", "longitude", "radiusKm", "tier", "isActive", "updatedAt")
          VALUES ${Prisma.join(values)}
          ON CONFLICT ("inseeCode") DO UPDATE SET
            "name" = EXCLUDED."name",
            "searchName" = EXCLUDED."searchName",
            "departmentCode" = EXCLUDED."departmentCode",
            "regionCode" = EXCLUDED."regionCode",
            "population" = EXCLUDED."population",
            "surfaceHa" = EXCLUDED."surfaceHa",
            "latitude" = EXCLUDED."latitude",
            "longitude" = EXCLUDED."longitude",
            "radiusKm" = EXCLUDED."radiusKm",
            "tier" = EXCLUDED."tier",
            "isActive" = true,
            "updatedAt" = EXCLUDED."updatedAt"`;
      }

      // Communes merged away since the last import leave the draw; their rows (and cards) stay.
      const deactivated = await tx.$executeRaw`
        UPDATE "Commune" SET "isActive" = false, "updatedAt" = ${importedAt}
        WHERE "isActive" AND "updatedAt" < ${importedAt}`;
      if (deactivated > 0)
        logger.warn({ count: deactivated }, "communes deactivated");
    },
    { timeout: 120_000 },
  );

  const byTier = await prisma.commune.groupBy({
    by: ["tier"],
    where: { isActive: true },
    _count: true,
    orderBy: { tier: "asc" },
  });
  logger.info(
    Object.fromEntries(byTier.map((t) => [t.tier, t._count])),
    "active communes per tier",
  );
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "commune import failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
