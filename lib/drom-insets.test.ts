import { describe, expect, it } from "vitest";
import {
  DROM_INSETS,
  fromInset,
  insetFor,
  toInset,
  type LonLat,
} from "./drom-insets";

describe("DROM insets", () => {
  it("covers the five DROM", () => {
    expect(DROM_INSETS.map((inset) => inset.code)).toEqual([
      "971",
      "972",
      "973",
      "974",
      "976",
    ]);
    expect(insetFor("75")).toBeUndefined();
  });

  it.each(DROM_INSETS)(
    "draws $code at its target and maps clicks back",
    (inset) => {
      expect(toInset(inset, inset.source)).toEqual(inset.target);

      const point: LonLat = [inset.source[0] + 0.1, inset.source[1] - 0.05];
      const [lon, lat] = fromInset(inset, toInset(inset, point));
      expect(lon).toBeCloseTo(point[0], 10);
      expect(lat).toBeCloseTo(point[1], 10);
    },
  );

  it("keeps insets west of mainland France", () => {
    for (const inset of DROM_INSETS) expect(inset.target[0]).toBeLessThan(-5.2);
  });
});
