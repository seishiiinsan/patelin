import { describe, expect, it } from "vitest";
import {
  FREE_BOOSTER_INTERVAL_MS as HOUR,
  FREE_BOOSTER_MAX,
  freeBoosterStock,
  takeFreeBooster,
} from "./free-boosters";

const t0 = new Date("2026-10-17T08:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);

describe("freeBoosterStock", () => {
  it("starts full", () => {
    expect(freeBoosterStock(null, t0)).toEqual({
      available: FREE_BOOSTER_MAX,
      nextAt: null,
    });
  });

  it("refills one booster per interval", () => {
    expect(freeBoosterStock(t0, at(0)).available).toBe(0);
    expect(freeBoosterStock(t0, at(HOUR - 1)).available).toBe(0);
    expect(freeBoosterStock(t0, at(HOUR)).available).toBe(1);
    expect(freeBoosterStock(t0, at(3.5 * HOUR))).toEqual({
      available: 3,
      nextAt: at(4 * HOUR),
    });
  });

  it("caps the stock at the maximum", () => {
    expect(freeBoosterStock(t0, at(100 * HOUR))).toEqual({
      available: FREE_BOOSTER_MAX,
      nextAt: null,
    });
  });

  it("never goes negative when the clock is ahead", () => {
    expect(freeBoosterStock(at(HOUR), t0).available).toBe(0);
  });
});

describe("takeFreeBooster", () => {
  it("takes one booster from a full stock", () => {
    const next = takeFreeBooster(null, t0);
    expect(freeBoosterStock(next, t0)).toEqual({
      available: FREE_BOOSTER_MAX - 1,
      nextAt: at(HOUR),
    });
  });

  it("keeps the progress towards the next booster", () => {
    // 2 boosters and 40 minutes towards the third.
    const from = at(-(2 * HOUR + 40 * 60_000));
    const next = takeFreeBooster(from, t0);
    expect(freeBoosterStock(next, t0)).toEqual({
      available: 1,
      nextAt: at(20 * 60_000),
    });
  });

  it("refuses when the stock is empty", () => {
    expect(takeFreeBooster(t0, at(HOUR - 1))).toBeNull();
  });

  it("empties the stock after the maximum number of boosters", () => {
    let clock: Date | null = null;
    for (let i = 0; i < FREE_BOOSTER_MAX; i++) {
      clock = takeFreeBooster(clock, t0);
      expect(clock).not.toBeNull();
    }
    expect(takeFreeBooster(clock, t0)).toBeNull();
    // An hour later, exactly one more.
    expect(freeBoosterStock(clock, at(HOUR)).available).toBe(1);
  });
});
