import { randomInt } from "node:crypto";

// A booster holds 4 cards drawn among all communes, then 1 among the Rare-or-better ones,
// revealed last.
export const UNIFORM_CARDS = 4;

// About 1 card in 100 comes out as an old postcard, when its commune has one.
export const POSTCARD_ODDS = 100;

// Returns an integer in [0, max). The default, node:crypto's randomInt, cannot be predicted by
// players; tests pass their own.
export type RandomInt = (max: number) => number;

export type DrawPool = {
  // INSEE codes that can be drawn, each with the same chance.
  all: readonly string[];
  // The Rare, Épique, Légendaire and Mythique communes among them.
  rarePlus: readonly string[];
};

function pick(codes: readonly string[], random: RandomInt): string {
  const code = codes[random(codes.length)];
  if (code === undefined)
    throw new RangeError("Cannot draw from an empty pool");
  return code;
}

// The INSEE codes of a booster's 5 cards, in reveal order. A commune can come out twice.
export function drawBooster(
  pool: DrawPool,
  random: RandomInt = randomInt,
): string[] {
  const uniform = Array.from({ length: UNIFORM_CARDS }, () =>
    pick(pool.all, random),
  );
  return [...uniform, pick(pool.rarePlus, random)];
}

// Whether a card whose commune has a postcard comes out as the postcard variant.
export function rollPostcard(random: RandomInt = randomInt): boolean {
  return random(POSTCARD_ODDS) === 0;
}
