import { cacheLife } from "next/cache";
import type { Tier } from "@/generated/prisma/enums";
import type { DrawPool } from "./draw";
import { departmentOfTheDay } from "./game-day";
import { prisma } from "./prisma";

const RARE_PLUS: Tier[] = ["RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"];

// A department booster needs enough communes to be worth opening: this leaves out Paris alone.
export const DEPARTMENT_BOOSTER_MIN_COMMUNES = 10;

// Active communes that can be drawn, for all of France or one department. The list only
// changes with the yearly INSEE import, so it is cached for hours.
export async function getDrawPool(
  departmentCode: string | null,
): Promise<DrawPool> {
  "use cache";
  cacheLife("hours");
  const communes = await prisma.commune.findMany({
    where: { isActive: true, ...(departmentCode && { departmentCode }) },
    select: { inseeCode: true, tier: true },
    orderBy: { inseeCode: "asc" },
  });
  return {
    all: communes.map((c) => c.inseeCode),
    rarePlus: communes
      .filter((c) => RARE_PLUS.includes(c.tier))
      .map((c) => c.inseeCode),
  };
}

// The department whose booster is offered on a given Paris day ("2026-10-17").
export async function getDepartmentOfTheDay(
  day: string,
): Promise<{ code: string; name: string }> {
  "use cache";
  cacheLife("hours");
  const departments = await prisma.department.findMany({
    select: {
      code: true,
      name: true,
      _count: { select: { communes: { where: { isActive: true } } } },
    },
  });
  const eligible = departments.filter(
    (d) => d._count.communes >= DEPARTMENT_BOOSTER_MIN_COMMUNES,
  );
  const code = departmentOfTheDay(
    eligible.map((d) => d.code),
    day,
  );
  const department = eligible.find((d) => d.code === code);
  if (!department) throw new Error(`Unknown department ${code}`);
  return { code, name: department.name };
}
