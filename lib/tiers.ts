// Rarity tiers: the more inhabitants a commune has, the rarer its card.
// Thresholds come from the spec (1k / 3k / 10k / 30k / 100k inhabitants).
export const TIERS = [
  { key: "commune", label: "Commune", minPopulation: 0 },
  { key: "peu-commune", label: "Peu commune", minPopulation: 1_000 },
  { key: "rare", label: "Rare", minPopulation: 3_000 },
  { key: "epique", label: "Épique", minPopulation: 10_000 },
  { key: "legendaire", label: "Légendaire", minPopulation: 30_000 },
  { key: "mythique", label: "Mythique", minPopulation: 100_000 },
] as const;

export type Tier = (typeof TIERS)[number];
export type TierKey = Tier["key"];

export function tierForPopulation(population: number): Tier {
  if (!Number.isInteger(population) || population < 0) {
    throw new RangeError(`Invalid population: ${population}`);
  }
  // The first tier starts at 0, so a valid population always finds one.
  return TIERS.findLast((tier) => population >= tier.minPopulation) ?? TIERS[0];
}
