// An "established" account may trade, enter the Patelin du jour top 10 and earn its referrer a
// reward. Both thresholds make farming with secondary accounts slow and costly.
export const ESTABLISHED_MIN_DAYS = 7;
export const ESTABLISHED_MIN_BOOSTERS = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

export type EligibilityInput = { createdAt: Date; boostersOpened: number };

export function isEstablished(user: EligibilityInput, now: Date): boolean {
  const ageDays = (now.getTime() - user.createdAt.getTime()) / DAY_MS;
  return (
    ageDays >= ESTABLISHED_MIN_DAYS &&
    user.boostersOpened >= ESTABLISHED_MIN_BOOSTERS
  );
}

// What is still missing, for the profile page ("encore 3 jours et 12 boosters").
export function missingForEstablished(user: EligibilityInput, now: Date) {
  const ageDays = (now.getTime() - user.createdAt.getTime()) / DAY_MS;
  return {
    days: Math.max(0, Math.ceil(ESTABLISHED_MIN_DAYS - ageDays)),
    boosters: Math.max(0, ESTABLISHED_MIN_BOOSTERS - user.boostersOpened),
  };
}
