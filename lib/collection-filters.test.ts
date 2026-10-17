import { describe, expect, it } from "vitest";
import { parseCollectionFilters } from "./collection-filters";

describe("parseCollectionFilters", () => {
  it("reads the filters from the URL", () => {
    expect(
      parseCollectionFilters({
        q: " Sainte ",
        tier: "rare",
        region: "53",
        departement: "2A",
        page: "3",
      }),
    ).toEqual({
      q: "Sainte",
      tier: "rare",
      region: "53",
      department: "2A",
      page: 3,
    });
  });

  it("defaults to everything, first page", () => {
    expect(parseCollectionFilters({})).toEqual({
      q: "",
      tier: null,
      region: null,
      department: null,
      page: 1,
    });
  });

  it("ignores values it does not know", () => {
    expect(
      parseCollectionFilters({
        tier: "legendary",
        region: "x",
        departement: "'; drop",
        page: "-2",
      }),
    ).toMatchObject({ tier: null, region: null, department: null, page: 1 });
  });

  it("takes the first value of a repeated parameter", () => {
    expect(parseCollectionFilters({ tier: ["epique", "rare"] }).tier).toBe(
      "epique",
    );
  });
});
