// The game's day follows Paris time: daily boosters and the department of the day change at
// midnight in Paris, whatever the player's time zone.
const parisDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-17"
export function parisDay(now: Date): string {
  return parisDate.format(now);
}

// The Paris day as a Date at UTC midnight, the way Prisma reads and writes a @db.Date column.
export function parisDayDate(now: Date): Date {
  return new Date(`${parisDay(now)}T00:00:00Z`);
}

// Days since 1970-01-01 (Paris calendar).
function dayNumber(day: string): number {
  return Date.parse(`${day}T00:00:00Z`) / DAY_MS;
}

// Mulberry32: a small seeded generator, so that the shuffle below is the same on every server.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

// Department codes in a fixed shuffled order, so that each comes back once per cycle and
// neighbours by code do not follow each other.
function shuffled(codes: readonly string[]): string[] {
  const order = [...codes].sort();
  const random = seededRandom(0x9a7e11);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

// The department of the day among `codes`: the same all day long, a different one the next day.
export function departmentOfTheDay(
  codes: readonly string[],
  day: string,
): string {
  const order = shuffled(codes);
  const code = order[dayNumber(day) % order.length];
  if (code === undefined) throw new RangeError("No department to choose from");
  return code;
}
