import { describe, expect, it } from "vitest";
import { isEstablished, missingForEstablished } from "./eligibility";

const now = new Date("2026-10-17T12:00:00Z");
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe("isEstablished", () => {
  it("needs 7 days and 50 boosters", () => {
    expect(
      isEstablished({ createdAt: daysAgo(7), boostersOpened: 50 }, now),
    ).toBe(true);
  });

  it("refuses a recent account, even a busy one", () => {
    expect(
      isEstablished({ createdAt: daysAgo(6.9), boostersOpened: 500 }, now),
    ).toBe(false);
  });

  it("refuses an old account that barely played", () => {
    expect(
      isEstablished({ createdAt: daysAgo(30), boostersOpened: 49 }, now),
    ).toBe(false);
  });
});

describe("missingForEstablished", () => {
  it("counts the days and boosters still needed", () => {
    expect(
      missingForEstablished(
        { createdAt: daysAgo(4.5), boostersOpened: 38 },
        now,
      ),
    ).toEqual({
      days: 3,
      boosters: 12,
    });
  });

  it("never goes below zero", () => {
    expect(
      missingForEstablished(
        { createdAt: daysAgo(40), boostersOpened: 90 },
        now,
      ),
    ).toEqual({
      days: 0,
      boosters: 0,
    });
  });
});
