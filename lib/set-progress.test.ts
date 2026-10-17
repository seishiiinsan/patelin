import { describe, expect, it } from "vitest";
import { formatSetProgress, sortSets, type SetProgress } from "./set-progress";

const set = (owned: number, size: number): SetProgress => ({
  slug: "s",
  type: "REGION",
  name: "Bretagne",
  owned,
  size,
});

describe("formatSetProgress", () => {
  it("counts the cards of small sets", () => {
    expect(formatSetProgress(set(4, 12))).toBe("4/12");
    expect(formatSetProgress(set(12, 101))).toBe("12/101");
  });

  it("gives large sets as a percentage, rounded down", () => {
    expect(formatSetProgress(set(500, 1_208))).toBe("41 %");
    expect(formatSetProgress(set(1_207, 1_208))).toBe("99 %");
    expect(formatSetProgress(set(1_208, 1_208))).toBe("100 %");
  });

  it("keeps a decimal under 10 %", () => {
    expect(formatSetProgress(set(80, 887))).toBe("9,0 %");
  });

  it("counts the cards of a large set under 1 %", () => {
    expect(formatSetProgress(set(1, 887))).toBe("1/887");
    expect(formatSetProgress(set(2, 4_030))).toBe("2/4\u202f030");
  });
});

describe("sortSets", () => {
  it("puts homonyms first and regions last", () => {
    const sorted = sortSets([
      { type: "REGION", name: "Bretagne" },
      { type: "DEPARTMENT", name: "Finistère" },
      { type: "HOMONYMS", name: "Sainte-Colombe" },
      { type: "DEPARTMENT", name: "Ain" },
    ] as const);
    expect(sorted.map((s) => s.name)).toEqual([
      "Sainte-Colombe",
      "Ain",
      "Finistère",
      "Bretagne",
    ]);
  });
});
