// Fills an empty database with a few Breton communes, for the end-to-end tests in CI: the
// real import downloads 35,000 communes and their photos. Figures are rounded and the cards
// have no photo (the cartoon fallback), so that the tests never call Wikimedia.
// Refuses to run on a database that holds other communes. Safe to run again.
// Usage: npm run data:fixture
import "dotenv/config";
import { toCommuneRow, type GeoApiCommune } from "@/lib/communes";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { buildSets } from "@/lib/sets";

const REGION = { code: "53", name: "Bretagne", chefLieu: "35238" };
const DEPARTMENTS = [
  { code: "29", name: "Finistère", regionCode: "53", chefLieu: "29232" },
  { code: "35", name: "Ille-et-Vilaine", regionCode: "53", chefLieu: "35238" },
];

// [INSEE code, name, department, population, surface (ha), longitude, latitude]
const COMMUNES: [string, string, string, number, number, number, number][] = [
  ["29019", "Brest", "29", 139_000, 4_970, -4.486, 48.39],
  ["29232", "Quimper", "29", 63_500, 8_445, -4.097, 47.996],
  ["29039", "Concarneau", "29", 20_000, 4_124, -3.914, 47.875],
  ["29151", "Morlaix", "29", 15_000, 2_482, -3.827, 48.577],
  ["29046", "Douarnenez", "29", 14_000, 2_500, -4.33, 48.093],
  ["29259", "Saint-Pol-de-Léon", "29", 6_600, 2_350, -3.985, 48.685],
  ["29197", "Plouhinec", "29", 4_000, 2_846, -4.489, 48.015],
  ["29217", "Pont-Aven", "29", 2_900, 1_600, -3.749, 47.855],
  ["29168", "Plogoff", "29", 1_200, 1_400, -4.665, 48.037],
  ["29155", "Ouessant", "29", 850, 1_558, -5.096, 48.459],
  ["29134", "Locronan", "29", 800, 820, -4.209, 48.098],
  ["29083", "Île-de-Sein", "29", 250, 58, -4.851, 48.038],
  ["35238", "Rennes", "35", 225_000, 5_039, -1.68, 48.112],
  ["35288", "Saint-Malo", "35", 47_000, 3_658, -2.007, 48.649],
  ["35049", "Cancale", "35", 5_200, 1_316, -1.851, 48.676],
];

async function main() {
  const rows = COMMUNES.flatMap(
    ([code, nom, codeDepartement, population, surface, lon, lat]) => {
      const raw: GeoApiCommune = {
        code,
        nom,
        codeDepartement,
        codeRegion: REGION.code,
        population,
        surface,
        centre: { type: "Point", coordinates: [lon, lat] },
      };
      return toCommuneRow(raw) ?? [];
    },
  );
  const codes = rows.map((row) => row.inseeCode);

  const others = await prisma.commune.count({
    where: { inseeCode: { notIn: codes } },
  });
  if (others > 0) {
    logger.error(
      { others },
      "the database holds real communes: the fixture is for an empty test database",
    );
    process.exitCode = 1;
    return;
  }

  await prisma.region.upsert({
    where: { code: REGION.code },
    create: REGION,
    update: REGION,
  });
  for (const department of DEPARTMENTS)
    await prisma.department.upsert({
      where: { code: department.code },
      create: department,
      update: department,
    });
  for (const row of rows)
    await prisma.commune.upsert({
      where: { inseeCode: row.inseeCode },
      create: row,
      update: row,
    });

  const sets = buildSets(rows, DEPARTMENTS, [REGION]);
  for (const set of sets) {
    await prisma.cardSet.upsert({
      where: { slug: set.slug },
      create: { slug: set.slug, type: set.type, name: set.name },
      update: { type: set.type, name: set.name },
    });
    await prisma.setMember.deleteMany({ where: { setSlug: set.slug } });
    await prisma.setMember.createMany({
      data: set.members.map((inseeCode) => ({ setSlug: set.slug, inseeCode })),
    });
  }

  logger.info({ communes: rows.length, sets: sets.length }, "fixture written");
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "fixture failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
