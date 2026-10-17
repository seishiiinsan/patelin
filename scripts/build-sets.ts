// Builds the card sets from the imported communes: one per department and region, the
// prefectures, and the homonyms. Safe to run again: sets are rewritten from scratch.
// Usage: npm run data:sets
import "dotenv/config";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { buildSets } from "@/lib/sets";

async function main() {
  const [communes, departments, regions] = await Promise.all([
    prisma.commune.findMany({
      where: { isActive: true },
      select: {
        inseeCode: true,
        name: true,
        departmentCode: true,
        regionCode: true,
      },
    }),
    prisma.department.findMany({
      select: { code: true, name: true, chefLieu: true },
    }),
    prisma.region.findMany({ select: { code: true, name: true } }),
  ]);
  const sets = buildSets(communes, departments, regions);

  await prisma.$transaction(
    async (tx) => {
      // Members cascade with their set.
      await tx.cardSet.deleteMany({
        where: { slug: { notIn: sets.map((s) => s.slug) } },
      });
      for (const set of sets) {
        await tx.cardSet.upsert({
          where: { slug: set.slug },
          create: { slug: set.slug, type: set.type, name: set.name },
          update: { type: set.type, name: set.name },
        });
        await tx.setMember.deleteMany({ where: { setSlug: set.slug } });
        await tx.setMember.createMany({
          data: set.members.map((inseeCode) => ({
            setSlug: set.slug,
            inseeCode,
          })),
        });
      }
    },
    { timeout: 120_000 },
  );

  const summary = Object.groupBy(sets, (s) => s.type);
  logger.info(
    Object.fromEntries(
      Object.entries(summary).map(([type, list]) => [
        type,
        {
          sets: list?.length,
          cards: list?.reduce((n, s) => n + s.members.length, 0),
        },
      ]),
    ),
    "sets written",
  );
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "set build failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
