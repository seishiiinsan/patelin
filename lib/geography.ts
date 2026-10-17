import { cacheLife } from "next/cache";
import { prisma } from "./prisma";

// Regions and departments for filters and labels. They only change with the yearly INSEE
// import, so they are cached for hours.
export async function getGeography() {
  "use cache";
  cacheLife("hours");
  const [regions, departments, activeCommunes] = await Promise.all([
    prisma.region.findMany({
      select: { code: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      select: { code: true, name: true },
      orderBy: { code: "asc" },
    }),
    prisma.commune.count({ where: { isActive: true } }),
  ]);
  return { regions, departments, activeCommunes };
}
