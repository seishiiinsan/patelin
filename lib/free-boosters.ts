// Free boosters refill on their own: 1 per hour, up to 8 in stock. The scope suggested 1 every
// 10 minutes (stock 10); its open questions recommend this slower pace, as 40 boosters a day
// would flood the market.
export const FREE_BOOSTER_INTERVAL_MS = 60 * 60 * 1000;
export const FREE_BOOSTER_MAX = 8;

// The stock is never stored, so no background task has to top it up. A single instant, `from`,
// stands for it: the stock is the number of whole intervals since `from`, capped at the maximum.
// Null means a full stock (a new player).
export type FreeBoosterClock = Date | null;

export type FreeBoosterStock = {
  available: number;
  // When the next booster arrives, or null when the stock is full.
  nextAt: Date | null;
};

export function freeBoosterStock(
  from: FreeBoosterClock,
  now: Date,
): FreeBoosterStock {
  if (from === null) return { available: FREE_BOOSTER_MAX, nextAt: null };
  const elapsed = Math.max(0, now.getTime() - from.getTime());
  const available = Math.min(
    FREE_BOOSTER_MAX,
    Math.floor(elapsed / FREE_BOOSTER_INTERVAL_MS),
  );
  if (available === FREE_BOOSTER_MAX) return { available, nextAt: null };
  return {
    available,
    nextAt: new Date(
      from.getTime() + (available + 1) * FREE_BOOSTER_INTERVAL_MS,
    ),
  };
}

// The clock after taking one booster, or null when the stock is empty.
export function takeFreeBooster(
  from: FreeBoosterClock,
  now: Date,
): Date | null {
  const { available } = freeBoosterStock(from, now);
  if (available === 0) return null;
  // Time spent with a full stock does not count towards the next booster.
  if (from === null || available === FREE_BOOSTER_MAX)
    return new Date(
      now.getTime() - (FREE_BOOSTER_MAX - 1) * FREE_BOOSTER_INTERVAL_MS,
    );
  // Otherwise the progress towards the next booster is kept.
  return new Date(from.getTime() + FREE_BOOSTER_INTERVAL_MS);
}
