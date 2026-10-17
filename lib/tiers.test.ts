import { describe, expect, it } from "vitest";
import { tierForPopulation } from "./tiers";

describe("tierForPopulation", () => {
  it.each([
    [0, "commune"],
    [999, "commune"],
    [1_000, "peu-commune"],
    [2_999, "peu-commune"],
    [3_000, "rare"],
    [9_999, "rare"],
    [10_000, "epique"],
    [29_999, "epique"],
    [30_000, "legendaire"],
    [99_999, "legendaire"],
    [100_000, "mythique"],
    [2_103_778, "mythique"],
  ])(
    "puts a commune of %i inhabitants in the %s tier",
    (population, expected) => {
      expect(tierForPopulation(population).key).toBe(expected);
    },
  );

  it.each([-1, 12.5, Number.NaN])(
    "rejects the invalid population %s",
    (population) => {
      expect(() => tierForPopulation(population)).toThrow(RangeError);
    },
  );
});
