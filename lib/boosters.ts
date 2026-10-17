import { Prisma, type Booster } from "@/generated/prisma/client";
import { cardCommuneSelect, toCardData, type CardData } from "./cards";
import {
  drawBooster,
  rollPostcard,
  type DrawPool,
  type RandomInt,
} from "./draw";
import { takeFreeBooster } from "./free-boosters";
import { parisDayDate } from "./game-day";
import { prisma } from "./prisma";
import { sortSets, type SetProgress } from "./set-progress";

type Tx = Prisma.TransactionClient;

export type BoosterFailure = "not-found" | "already-opened" | "empty-stock";

export class BoosterError extends Error {
  constructor(readonly reason: BoosterFailure) {
    super(`Booster refused: ${reason}`);
    this.name = "BoosterError";
  }
}

export type OpenedCard = CardData & { isNew: boolean };

export type OpenedBooster = {
  boosterId: string;
  // In reveal order: the Rare-or-better card comes last.
  cards: OpenedCard[];
  // Sets that gained a commune, with their progress after the opening.
  sets: SetProgress[];
};

type OpenOptions = {
  userId: string;
  // Pool of a department's communes, or of all of France when null.
  poolFor: (departmentCode: string | null) => Promise<DrawPool>;
  random?: RandomInt;
  now?: Date;
};

// The daily booster and the department-of-the-day booster, given on the player's first visit
// of the day. Calling it again the same day changes nothing: the unique index on
// (user, kind, day) keeps one of each.
export async function grantDailyBoosters(
  userId: string,
  departmentCode: string,
  now = new Date(),
) {
  const day = parisDayDate(now);
  await prisma.booster.createMany({
    data: [
      { userId, kind: "DAILY", day },
      { userId, kind: "DEPARTMENT", day, departmentCode },
    ],
    skipDuplicates: true,
  });
}

// Boosters the player has received and not opened yet, oldest first.
export function unopenedBoosters(userId: string) {
  return prisma.booster.findMany({
    where: { userId, openedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, kind: true, departmentCode: true, day: true },
  });
}

// Opens a booster the player owns. All or nothing, and only once.
export async function openStoredBooster(
  boosterId: string,
  options: OpenOptions,
): Promise<OpenedBooster> {
  return prisma.$transaction(async (tx) => {
    const booster = await tx.booster.findFirst({
      where: { id: boosterId, userId: options.userId },
    });
    if (!booster) throw new BoosterError("not-found");
    if (booster.openedAt) throw new BoosterError("already-opened");
    return fillBooster(tx, booster, options);
  });
}

// Takes a booster from the free stock and opens it, in one transaction.
export async function openFreeBooster(
  options: OpenOptions,
): Promise<OpenedBooster> {
  const now = options.now ?? new Date();
  return prisma.$transaction(async (tx) => {
    // Locks the player's row: two free openings at once take two boosters, never the same one.
    const [user] = await tx.$queryRaw<{ freeBoostersFrom: Date | null }[]>`
      SELECT "freeBoostersFrom" FROM "user" WHERE "id" = ${options.userId} FOR UPDATE`;
    if (!user) throw new BoosterError("not-found");
    const next = takeFreeBooster(user.freeBoostersFrom, now);
    if (!next) throw new BoosterError("empty-stock");

    await tx.user.update({
      where: { id: options.userId },
      data: { freeBoostersFrom: next },
    });
    const booster = await tx.booster.create({
      data: { userId: options.userId, kind: "FREE" },
    });
    return fillBooster(tx, booster, { ...options, now });
  });
}

async function fillBooster(
  tx: Tx,
  booster: Booster,
  { userId, poolFor, random, now = new Date() }: OpenOptions,
): Promise<OpenedBooster> {
  const codes = drawBooster(await poolFor(booster.departmentCode), random);

  // Claims the booster before anything else: when two openings race, the second one waits on
  // this row, then finds it opened and gives up.
  const claimed = await tx.booster.updateMany({
    where: { id: booster.id, openedAt: null },
    data: { openedAt: now, communeCodes: codes },
  });
  if (claimed.count === 0) throw new BoosterError("already-opened");

  const communes = await tx.commune.findMany({
    where: { inseeCode: { in: codes } },
    select: cardCommuneSelect,
  });
  const byCode = new Map(communes.map((c) => [c.inseeCode, c]));
  const commune = (code: string) => {
    const found = byCode.get(code);
    if (!found) throw new Error(`Drawn commune ${code} not found`);
    return found;
  };
  const postcards = codes.map(
    (code) => commune(code).postcardThumbUrl !== null && rollPostcard(random),
  );

  const distinct = [...new Set(codes)];
  const ownedBefore = await ownedAmong(tx, userId, distinct);

  // Normal cards go to the player's stacks; a postcard counts 0 there but still creates the
  // row, which marks the commune as no longer new.
  const increments = distinct.map(
    (code) => codes.filter((c, i) => c === code && !postcards[i]).length,
  );
  const stacks = await tx.$queryRaw<{ inseeCode: string; inserted: boolean }[]>`
    INSERT INTO "CardStack" ("userId", "inseeCode", "count")
    SELECT ${userId}, code, n
    FROM unnest(${distinct}::text[], ${increments}::int[]) AS added(code, n)
    ON CONFLICT ("userId", "inseeCode")
      DO UPDATE SET "count" = "CardStack"."count" + EXCLUDED."count"
    RETURNING "inseeCode", (xmax = 0) AS "inserted"`;
  const firstSeen = new Set(
    stacks.filter((s) => s.inserted).map((s) => s.inseeCode),
  );
  // Only the first card of a commune is new, even when it comes out twice in the booster.
  const newPositions = codes.flatMap((code, i) =>
    firstSeen.has(code) && codes.indexOf(code) === i ? [i] : [],
  );

  const variants = codes.flatMap((code, i) =>
    postcards[i]
      ? [
          {
            ownerId: userId,
            inseeCode: code,
            variant: "POSTCARD" as const,
            tier: commune(code).tier,
            boosterId: booster.id,
          },
        ]
      : [],
  );
  if (variants.length > 0) await tx.cardInstance.createMany({ data: variants });

  await tx.booster.update({
    where: { id: booster.id },
    data: { newPositions },
  });
  await tx.user.update({
    where: { id: userId },
    data: { boostersOpened: { increment: 1 } },
  });

  const gained = distinct.filter((code) => !ownedBefore.has(code));
  return {
    boosterId: booster.id,
    cards: codes.map((code, i) => ({
      ...toCardData(commune(code), postcards[i] ? "postcard" : null),
      isNew: newPositions.includes(i),
    })),
    sets: await setProgress(tx, userId, gained),
  };
}

// Communes among `codes` of which the player holds at least one card.
async function ownedAmong(
  db: Tx,
  userId: string,
  codes: string[],
): Promise<Set<string>> {
  const rows = await db.$queryRaw<{ inseeCode: string }[]>`
    SELECT "inseeCode" FROM "CardStack"
    WHERE "userId" = ${userId} AND "count" > 0 AND "inseeCode" = ANY(${codes}::text[])
    UNION
    SELECT "inseeCode" FROM "CardInstance"
    WHERE "ownerId" = ${userId} AND "inseeCode" = ANY(${codes}::text[])`;
  return new Set(rows.map((r) => r.inseeCode));
}

// Progress of every set that holds one of `codes`: communes the player holds over set size.
export async function setProgress(
  db: Tx,
  userId: string,
  codes: string[],
): Promise<SetProgress[]> {
  if (codes.length === 0) return [];
  const rows = await db.$queryRaw<SetProgress[]>`
    SELECT s."slug", s."type", s."name", count(*)::int AS "size",
      count(*) FILTER (WHERE
        EXISTS (SELECT 1 FROM "CardStack" cs
                WHERE cs."userId" = ${userId} AND cs."inseeCode" = m."inseeCode" AND cs."count" > 0)
        OR EXISTS (SELECT 1 FROM "CardInstance" ci
                   WHERE ci."ownerId" = ${userId} AND ci."inseeCode" = m."inseeCode")
      )::int AS "owned"
    FROM "CardSet" s
    JOIN "SetMember" m ON m."setSlug" = s."slug"
    WHERE s."slug" IN (
      SELECT "setSlug" FROM "SetMember" WHERE "inseeCode" = ANY(${codes}::text[])
    )
    GROUP BY s."slug"`;
  return sortSets(rows);
}
