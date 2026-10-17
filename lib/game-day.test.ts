import { describe, expect, it } from "vitest";
import { departmentOfTheDay, parisDay, parisDayDate } from "./game-day";

const CODES = Array.from({ length: 95 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
).filter((code) => code !== "20");

describe("parisDay", () => {
  it("changes at midnight in Paris, in summer and in winter", () => {
    // UTC+2 in summer.
    expect(parisDay(new Date("2026-07-14T21:59:59Z"))).toBe("2026-07-14");
    expect(parisDay(new Date("2026-07-14T22:00:00Z"))).toBe("2026-07-15");
    // UTC+1 in winter.
    expect(parisDay(new Date("2026-12-31T22:59:59Z"))).toBe("2026-12-31");
    expect(parisDay(new Date("2026-12-31T23:00:00Z"))).toBe("2027-01-01");
  });

  it("is stored as a UTC midnight date", () => {
    expect(parisDayDate(new Date("2026-10-17T23:30:00Z"))).toEqual(
      new Date("2026-10-18T00:00:00Z"),
    );
  });
});

describe("departmentOfTheDay", () => {
  it("stays the same all day long", () => {
    const morning = parisDay(new Date("2026-10-17T00:00:00+02:00"));
    const evening = parisDay(new Date("2026-10-17T23:59:59+02:00"));
    expect(departmentOfTheDay(CODES, morning)).toBe(
      departmentOfTheDay(CODES, evening),
    );
  });

  it("changes every day at midnight", () => {
    const before = parisDay(new Date("2026-10-17T23:59:59+02:00"));
    const after = parisDay(new Date("2026-10-18T00:00:00+02:00"));
    expect(departmentOfTheDay(CODES, before)).not.toBe(
      departmentOfTheDay(CODES, after),
    );
  });

  it("shows every department once per cycle", () => {
    const start = Date.parse("2026-01-01T00:00:00Z");
    const days = CODES.map((_, i) =>
      new Date(start + i * 86_400_000).toISOString().slice(0, 10),
    );
    const chosen = days.map((day) => departmentOfTheDay(CODES, day));
    expect(new Set(chosen).size).toBe(CODES.length);
  });

  it("does not depend on the order of the codes", () => {
    expect(departmentOfTheDay([...CODES].reverse(), "2026-10-17")).toBe(
      departmentOfTheDay(CODES, "2026-10-17"),
    );
  });
});
