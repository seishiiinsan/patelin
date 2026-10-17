import { describe, expect, it } from "vitest";
import { buildSets, HOMONYM_MIN_COMMUNES, slugify } from "./sets";

describe("slugify", () => {
  it.each([
    ["Sainte-Colombe", "sainte-colombe"],
    ["Île-de-France", "ile-de-france"],
    ["Provence-Alpes-Côte d'Azur", "provence-alpes-cote-d-azur"],
  ])("turns %s into %s", (text, slug) => {
    expect(slugify(text)).toBe(slug);
  });
});

describe("buildSets", () => {
  const commune = (inseeCode: string, name: string, departmentCode = "12") => ({
    inseeCode,
    name,
    departmentCode,
    regionCode: "76",
  });
  const departments = [
    { code: "12", name: "Aveyron", chefLieu: "12202" },
    { code: "2A", name: "Corse-du-Sud", chefLieu: "2A004" },
  ];
  const regions = [{ code: "76", name: "Occitanie" }];

  it("builds department, region and prefecture sets", () => {
    const sets = buildSets(
      [commune("12202", "Rodez"), commune("12145", "Millau")],
      departments,
      regions,
    );
    expect(sets).toEqual([
      {
        slug: "departement-12",
        type: "DEPARTMENT",
        name: "Aveyron",
        members: ["12145", "12202"],
      },
      {
        slug: "region-occitanie",
        type: "REGION",
        name: "Occitanie",
        members: ["12145", "12202"],
      },
      {
        slug: "prefectures",
        type: "PREFECTURES",
        name: "Préfectures",
        members: ["12202"],
      },
    ]);
  });

  it(`makes a homonym set only from ${HOMONYM_MIN_COMMUNES} communes`, () => {
    const many = Array.from({ length: HOMONYM_MIN_COMMUNES }, (_, i) =>
      commune(`12${String(i).padStart(3, "0")}`, "Saint-Loup"),
    );
    const few = Array.from({ length: HOMONYM_MIN_COMMUNES - 1 }, (_, i) =>
      commune(`13${String(i).padStart(3, "0")}`, "Brion"),
    );
    const homonyms = buildSets([...many, ...few], departments, regions).filter(
      (set) => set.type === "HOMONYMS",
    );
    expect(homonyms.map((set) => set.slug)).toEqual(["homonymes-saint-loup"]);
    expect(homonyms[0]?.members).toHaveLength(HOMONYM_MIN_COMMUNES);
  });

  it("leaves out empty sets", () => {
    const sets = buildSets([commune("12202", "Rodez")], departments, regions);
    expect(sets.some((set) => set.slug === "departement-2a")).toBe(false);
  });
});
