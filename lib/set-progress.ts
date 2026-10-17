import type { SetType } from "@/generated/prisma/enums";

export type SetProgress = {
  slug: string;
  type: SetType;
  name: string;
  owned: number;
  size: number;
};

// Small sets read as a count ("4/12"), large ones as a percentage ("41 %") once past 1 %.
const COUNT_UP_TO = 120;

const count = new Intl.NumberFormat("fr-FR");
const percent = (digits: number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export function formatSetProgress({ owned, size }: SetProgress): string {
  const value = (owned / size) * 100;
  if (size <= COUNT_UP_TO || value < 1)
    return `${count.format(owned)}/${count.format(size)}`;
  // Rounded down, so that a set only reads 100 % once complete.
  if (value < 10) return `${percent(1).format(Math.floor(value * 10) / 10)} %`;
  return `${percent(0).format(Math.floor(value))} %`;
}

// Homonyms first: they are the sets a booster is most likely to move along visibly.
const TYPE_ORDER: SetType[] = [
  "HOMONYMS",
  "PREFECTURES",
  "DEPARTMENT",
  "REGION",
];

export function sortSets<T extends Pick<SetProgress, "type" | "name">>(
  sets: T[],
): T[] {
  return [...sets].sort(
    (a, b) =>
      TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
      a.name.localeCompare(b.name, "fr"),
  );
}
