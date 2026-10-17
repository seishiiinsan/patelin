import type { SetType } from "@/generated/prisma/enums";
import { stripAccents } from "./text";

// A name shared by at least this many communes makes a homonym set (19 sets, 167 cards in 2026).
export const HOMONYM_MIN_COMMUNES = 8;

export type SetDefinition = {
  slug: string;
  type: SetType;
  name: string;
  members: string[]; // INSEE codes
};

type CommuneInput = {
  inseeCode: string;
  name: string;
  departmentCode: string;
  regionCode: string;
};
type DepartmentInput = { code: string; name: string; chefLieu: string };
type RegionInput = { code: string; name: string };

// "Sainte-Colombe" → "sainte-colombe", "Île-de-France" → "ile-de-france"
export function slugify(text: string): string {
  return stripAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return groups;
}

export function buildSets(
  communes: CommuneInput[],
  departments: DepartmentInput[],
  regions: RegionInput[],
): SetDefinition[] {
  const byDepartment = groupBy(communes, (c) => c.departmentCode);
  const byRegion = groupBy(communes, (c) => c.regionCode);
  const byName = groupBy(communes, (c) => c.name);
  const codes = (list: CommuneInput[] | undefined) =>
    (list ?? []).map((c) => c.inseeCode).sort();
  const known = new Set(communes.map((c) => c.inseeCode));

  const departmentSets = departments.map((d) => ({
    slug: `departement-${d.code.toLowerCase()}`,
    type: "DEPARTMENT" as const,
    name: d.name,
    members: codes(byDepartment.get(d.code)),
  }));

  const regionSets = regions.map((r) => ({
    slug: `region-${slugify(r.name)}`,
    type: "REGION" as const,
    name: r.name,
    members: codes(byRegion.get(r.code)),
  }));

  const prefectures = {
    slug: "prefectures",
    type: "PREFECTURES" as const,
    name: "Préfectures",
    members: departments
      .map((d) => d.chefLieu)
      .filter((code) => known.has(code))
      .sort(),
  };

  const homonymSets = [...byName.entries()]
    .filter(([, list]) => list.length >= HOMONYM_MIN_COMMUNES)
    .map(([name, list]) => ({
      slug: `homonymes-${slugify(name)}`,
      type: "HOMONYMS" as const,
      name,
      members: codes(list),
    }));

  return [...departmentSets, ...regionSets, prefectures, ...homonymSets].filter(
    (set) => set.members.length > 0,
  );
}
