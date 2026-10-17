// Checks the imported data against what the game relies on. Exits with code 1 on any failure.
// Usage: npm run data:check
import "dotenv/config";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { HOMONYM_MIN_COMMUNES } from "@/lib/sets";
import { MIN_RADIUS_KM, dbTierForPopulation } from "@/lib/communes";

type Check = { name: string; run: () => Promise<string | null> };

// Each check returns null when it passes, or a short description of the problem.
const checks: Check[] = [
  {
    name: "34,875 active communes (métropole + DROM)",
    run: async () => {
      const count = await prisma.commune.count({ where: { isActive: true } });
      return count === 34_875 ? null : `${count} active communes`;
    },
  },
  {
    name: "101 departments in 18 regions",
    run: async () => {
      const [departments, regions] = await Promise.all([
        prisma.department.count(),
        prisma.region.count(),
      ]);
      return departments === 101 && regions === 18
        ? null
        : `${departments} departments, ${regions} regions`;
    },
  },
  {
    name: "every commune has a center inside France or the DROM",
    run: async () => {
      const bad = await prisma.commune.findMany({
        where: {
          OR: [
            { latitude: { lt: -22 } },
            { latitude: { gt: 52 } },
            { longitude: { lt: -62 } },
            { longitude: { gt: 56 } },
          ],
        },
        select: { inseeCode: true },
      });
      return bad.length === 0
        ? null
        : `out of bounds: ${bad.map((c) => c.inseeCode).join(", ")}`;
    },
  },
  {
    name: "every commune has a surface and a radius of at least 1.5 km",
    run: async () => {
      const bad = await prisma.commune.count({
        where: {
          OR: [{ surfaceHa: { lte: 0 } }, { radiusKm: { lt: MIN_RADIUS_KM } }],
        },
      });
      return bad === 0
        ? null
        : `${bad} communes without a valid surface or radius`;
    },
  },
  {
    name: "every commune's tier matches its population",
    run: async () => {
      const communes = await prisma.commune.findMany({
        select: { inseeCode: true, population: true, tier: true },
      });
      const bad = communes.filter(
        (c) => c.tier !== dbTierForPopulation(c.population),
      );
      return bad.length === 0
        ? null
        : `${bad.length} communes in the wrong tier`;
    },
  },
  {
    name: "tier pyramid matches the spec (24,844 / 6,253 / 2,730 / 759 / 247 / 42)",
    run: async () => {
      const rows = await prisma.commune.groupBy({
        by: ["tier"],
        where: { isActive: true },
        _count: true,
        orderBy: { tier: "asc" },
      });
      const counts = rows.map((r) => r._count).join(" / ");
      return counts === "24844 / 6253 / 2730 / 759 / 247 / 42"
        ? null
        : `got ${counts}`;
    },
  },
  {
    name: "every photo has a thumbnail and a license",
    run: async () => {
      const bad = await prisma.commune.count({
        where: {
          photoFile: { not: null },
          OR: [{ photoThumbUrl: null }, { photoLicense: null }],
        },
      });
      return bad === 0
        ? null
        : `${bad} photos without thumbnail or license (run data:photos)`;
    },
  },
  {
    name: "every department and region set holds all its communes",
    run: async () => {
      const [departmentCards, regionCards, communes] = await Promise.all([
        prisma.setMember.count({ where: { set: { type: "DEPARTMENT" } } }),
        prisma.setMember.count({ where: { set: { type: "REGION" } } }),
        prisma.commune.count({ where: { isActive: true } }),
      ]);
      return departmentCards === communes && regionCards === communes
        ? null
        : `${departmentCards} department cards, ${regionCards} region cards for ${communes} communes`;
    },
  },
  {
    name: `homonym sets have at least ${HOMONYM_MIN_COMMUNES} cards each`,
    run: async () => {
      const sets = await prisma.cardSet.findMany({
        where: { type: "HOMONYMS" },
        select: { slug: true, _count: { select: { members: true } } },
      });
      const small = sets.filter((s) => s._count.members < HOMONYM_MIN_COMMUNES);
      if (sets.length === 0) return "no homonym set (run data:sets)";
      return small.length === 0
        ? null
        : `too small: ${small.map((s) => s.slug).join(", ")}`;
    },
  },
];

async function main() {
  let failed = 0;
  for (const check of checks) {
    const problem = await check.run();
    if (problem) {
      failed++;
      logger.error({ check: check.name, problem }, "check failed");
    } else {
      logger.info({ check: check.name }, "check passed");
    }
  }
  if (failed > 0) process.exitCode = 1;
  logger.info({ passed: checks.length - failed, failed }, "data checks done");
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "data checks crashed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
