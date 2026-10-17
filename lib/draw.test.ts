import { describe, expect, it } from "vitest";
import { drawBooster, rollPostcard, type DrawPool } from "./draw";

// Tier sizes of the 34,875 communes in 2026 (lib/tiers.ts thresholds).
const TIER_SIZES = {
  COMMUNE: 24_844,
  PEU_COMMUNE: 6_253,
  RARE: 2_730,
  EPIQUE: 759,
  LEGENDAIRE: 247,
  MYTHIQUE: 42,
} as const;
type TierName = keyof typeof TIER_SIZES;
const RARE_PLUS: TierName[] = ["RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"];

// Fake INSEE codes that carry their tier: "RARE-17".
const all = Object.entries(TIER_SIZES).flatMap(([tier, size]) =>
  Array.from({ length: size }, (_, i) => `${tier}-${i}`),
);
const pool: DrawPool = {
  all,
  rarePlus: all.filter((code) =>
    RARE_PLUS.some((t) => code.startsWith(`${t}-`)),
  ),
};
const tierOf = (code: string) =>
  code.slice(0, code.lastIndexOf("-")) as TierName;

function percentages(codes: string[]) {
  const counts = new Map<TierName, number>();
  for (const code of codes)
    counts.set(tierOf(code), (counts.get(tierOf(code)) ?? 0) + 1);
  return (tiers: TierName[]) =>
    tiers.map((tier) => ((counts.get(tier) ?? 0) / codes.length) * 100);
}

describe("drawBooster", () => {
  it("draws 5 cards, the last one Rare or better", () => {
    for (let i = 0; i < 1_000; i++) {
      const codes = drawBooster(pool);
      expect(codes).toHaveLength(5);
      expect(RARE_PLUS).toContain(tierOf(codes[4]!));
    }
  });

  // With the real cryptographic generator. 1,000,000 boosters keep the 0.1-point check far
  // from random failures: the widest standard deviation is 0.023 point on the first 4 cards.
  it("matches the expected tier rates over 1,000,000 boosters", () => {
    const uniform: string[] = [];
    const guaranteed: string[] = [];
    for (let i = 0; i < 1_000_000; i++) {
      const codes = drawBooster(pool);
      uniform.push(...codes.slice(0, 4));
      guaranteed.push(codes[4]!);
    }

    const tiers = Object.keys(TIER_SIZES) as TierName[];
    const expected = tiers.map((t) => (TIER_SIZES[t] / all.length) * 100);
    const observed = percentages(uniform)(tiers);
    // 71.2 % Commune, 17.9 % Peu commune, 7.8 % Rare, 2.2 % Épique, 0.7 % Légendaire…
    observed.forEach((rate, i) =>
      expect(Math.abs(rate - expected[i]!)).toBeLessThan(0.1),
    );

    // The last card: 72.3 % Rare, 20.1 % Épique, 6.5 % Légendaire, 1.1 % Mythique.
    const rarePlusTotal = RARE_PLUS.reduce((n, t) => n + TIER_SIZES[t], 0);
    const lastObserved = percentages(guaranteed)(RARE_PLUS);
    RARE_PLUS.forEach((tier, i) =>
      expect(
        Math.abs(lastObserved[i]! - (TIER_SIZES[tier] / rarePlusTotal) * 100),
      ).toBeLessThan(0.2),
    );
  }, 60_000);

  it("refuses an empty pool", () => {
    expect(() => drawBooster({ all: [], rarePlus: ["x"] })).toThrow(RangeError);
    expect(() => drawBooster({ all: ["x"], rarePlus: [] })).toThrow(RangeError);
  });

  it("uses the random generator it is given", () => {
    const codes = drawBooster(
      { all: ["a", "b", "c"], rarePlus: ["r", "s"] },
      (max) => max - 1,
    );
    expect(codes).toEqual(["c", "c", "c", "c", "s"]);
  });
});

describe("rollPostcard", () => {
  it("comes out about once in 100 cards", () => {
    let postcards = 0;
    for (let i = 0; i < 100_000; i++) if (rollPostcard()) postcards++;
    // Mean 1,000, standard deviation 31.5.
    expect(postcards).toBeGreaterThan(850);
    expect(postcards).toBeLessThan(1_150);
  });
});
