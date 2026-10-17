import { describe, expect, it } from "vitest";
import {
  equivalentRadiusKm,
  isInPerimeter,
  MIN_RADIUS_KM,
  toCommuneRow,
  type GeoApiCommune,
} from "./communes";

const rodez: GeoApiCommune = {
  code: "12202",
  nom: "Rodez",
  codeDepartement: "12",
  codeRegion: "76",
  population: 24_469,
  surface: 1_118,
  centre: { type: "Point", coordinates: [2.5649, 44.3584] },
};

describe("isInPerimeter", () => {
  it.each(["01", "2A", "2B", "75", "971", "976"])(
    "keeps department %s",
    (code) => {
      expect(isInPerimeter(code)).toBe(true);
    },
  );

  it.each(["975", "977", "978", "984", "986", "987", "988", "989"])(
    "leaves out overseas collectivity %s",
    (code) => {
      expect(isInPerimeter(code)).toBe(false);
    },
  );
});

describe("equivalentRadiusKm", () => {
  it("is the radius of a disc with the same surface", () => {
    // 10 503 ha (Paris) → √(105.03 / π) ≈ 5.78 km
    expect(equivalentRadiusKm(10_503)).toBeCloseTo(5.782, 2);
  });

  it("never goes below the floor", () => {
    expect(equivalentRadiusKm(50)).toBe(MIN_RADIUS_KM);
  });
});

describe("toCommuneRow", () => {
  it("maps an API record to a row", () => {
    expect(toCommuneRow(rodez)).toEqual({
      inseeCode: "12202",
      name: "Rodez",
      departmentCode: "12",
      regionCode: "76",
      population: 24_469,
      surfaceHa: 1_118,
      latitude: 44.3584,
      longitude: 2.5649,
      radiusKm: expect.closeTo(1.886, 2),
      tier: "EPIQUE",
    });
  });

  it("skips communes outside the perimeter", () => {
    expect(toCommuneRow({ ...rodez, codeDepartement: "987" })).toBeNull();
  });

  it("skips communes without population", () => {
    expect(toCommuneRow({ ...rodez, population: undefined })).toBeNull();
  });

  it("keeps villages with no inhabitant", () => {
    expect(toCommuneRow({ ...rodez, population: 0 })?.tier).toBe("COMMUNE");
  });
});
