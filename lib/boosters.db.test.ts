import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  BoosterError,
  grantDailyBoosters,
  openFreeBooster,
  openStoredBooster,
} from "./boosters";
import type { DrawPool, RandomInt } from "./draw";
import { FREE_BOOSTER_MAX } from "./free-boosters";
import { prisma } from "./prisma";

// Fixture rows live in a fake region and department, apart from the real data.
const REGION = "T9";
const DEPARTMENT = "T9";
const SET = "test-homonymes-t9";
const COMMUNES = [
  { inseeCode: "T9001", name: "Testville", tier: "COMMUNE" },
  { inseeCode: "T9002", name: "Testbourg", tier: "COMMUNE" },
  { inseeCode: "T9003", name: "Testmont", tier: "PEU_COMMUNE" },
  { inseeCode: "T9004", name: "Testcité", tier: "RARE" },
  { inseeCode: "T9005", name: "Testpolis", tier: "MYTHIQUE" },
] as const;
const pool: DrawPool = {
  all: ["T9001", "T9002", "T9003"],
  rarePlus: ["T9004", "T9005"],
};
const poolFor = async () => pool;

// Always the first commune of each list, and every eligible card as a postcard.
const firstPick: RandomInt = () => 0;

async function createPlayer() {
  const id = `test-${randomUUID()}`;
  await prisma.user.create({
    data: {
      id,
      name: "Test",
      email: `${id}@patelin.test`,
      pseudo: id.slice(0, 20),
    },
  });
  return id;
}

beforeAll(async () => {
  await prisma.region.create({
    data: { code: REGION, name: "Région de test", chefLieu: "T9001" },
  });
  await prisma.department.create({
    data: {
      code: DEPARTMENT,
      name: "Département de test",
      regionCode: REGION,
      chefLieu: "T9001",
    },
  });
  await prisma.commune.createMany({
    data: COMMUNES.map((c) => ({
      ...c,
      searchName: c.name.toLowerCase(),
      departmentCode: DEPARTMENT,
      regionCode: REGION,
      population: 100,
      surfaceHa: 1_000,
      latitude: 45,
      longitude: 2,
      radiusKm: 1.5,
      // Only the Mythique one has a postcard.
      postcardThumbUrl:
        c.tier === "MYTHIQUE" ? "https://upload.wikimedia.org/x.jpg" : null,
    })),
  });
  await prisma.cardSet.create({
    data: {
      slug: SET,
      type: "HOMONYMS",
      name: "Test",
      members: {
        create: [
          { inseeCode: "T9001" },
          { inseeCode: "T9002" },
          { inseeCode: "T9003" },
        ],
      },
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { startsWith: "test-" } } });
  await prisma.cardSet.deleteMany({ where: { slug: SET } });
  await prisma.commune.deleteMany({ where: { departmentCode: DEPARTMENT } });
  await prisma.department.deleteMany({ where: { code: DEPARTMENT } });
  await prisma.region.deleteMany({ where: { code: REGION } });
  await prisma.$disconnect();
});

describe("grantDailyBoosters", () => {
  it("gives one daily booster per Paris day", async () => {
    const userId = await createPlayer();
    const morning = new Date("2026-10-17T06:00:00Z");
    const evening = new Date("2026-10-17T21:00:00Z");
    const nextDay = new Date("2026-10-17T22:30:00Z"); // 00:30 in Paris

    await Promise.all([
      grantDailyBoosters(userId, DEPARTMENT, morning),
      grantDailyBoosters(userId, DEPARTMENT, morning),
    ]);
    await grantDailyBoosters(userId, DEPARTMENT, evening);
    expect(
      await prisma.booster.count({ where: { userId, kind: "DAILY" } }),
    ).toBe(1);
    expect(
      await prisma.booster.count({ where: { userId, kind: "DEPARTMENT" } }),
    ).toBe(1);

    await grantDailyBoosters(userId, DEPARTMENT, nextDay);
    expect(
      await prisma.booster.count({ where: { userId, kind: "DAILY" } }),
    ).toBe(2);
  });
});

describe("openStoredBooster", () => {
  it("opens a booster only once, even twice at the same time", async () => {
    const userId = await createPlayer();
    await grantDailyBoosters(userId, DEPARTMENT);
    const { id } = await prisma.booster.findFirstOrThrow({
      where: { userId, kind: "DAILY" },
    });

    const results = await Promise.allSettled([
      openStoredBooster(id, { userId, poolFor }),
      openStoredBooster(id, { userId, poolFor }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r) => r.status === "rejected");
    expect(rejected?.reason).toBeInstanceOf(BoosterError);
    expect((rejected?.reason as BoosterError).reason).toBe("already-opened");

    const cards = await prisma.cardStack.aggregate({
      where: { userId },
      _sum: { count: true },
    });
    const instances = await prisma.cardInstance.count({
      where: { ownerId: userId },
    });
    expect((cards._sum.count ?? 0) + instances).toBe(5);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.boostersOpened).toBe(1);
    const booster = await prisma.booster.findUniqueOrThrow({ where: { id } });
    expect(booster.openedAt).not.toBeNull();
    expect(booster.communeCodes).toHaveLength(5);
  });

  it("refuses another player's booster", async () => {
    const owner = await createPlayer();
    const thief = await createPlayer();
    await grantDailyBoosters(owner, DEPARTMENT);
    const { id } = await prisma.booster.findFirstOrThrow({
      where: { userId: owner },
    });
    await expect(
      openStoredBooster(id, { userId: thief, poolFor }),
    ).rejects.toMatchObject({
      reason: "not-found",
    });
  });

  it("marks only the first card of a commune as new", async () => {
    const userId = await createPlayer();
    await grantDailyBoosters(userId, DEPARTMENT);
    const boosters = await prisma.booster.findMany({ where: { userId } });

    // T9001 four times, then T9004 (no postcard for either).
    const first = await openStoredBooster(boosters[0]!.id, {
      userId,
      poolFor,
      random: firstPick,
    });
    expect(first.cards.map((c) => c.inseeCode)).toEqual([
      "T9001",
      "T9001",
      "T9001",
      "T9001",
      "T9004",
    ]);
    expect(first.cards.map((c) => c.isNew)).toEqual([
      true,
      false,
      false,
      false,
      true,
    ]);

    const second = await openStoredBooster(boosters[1]!.id, {
      userId,
      poolFor,
      random: firstPick,
    });
    expect(second.cards.some((c) => c.isNew)).toBe(false);
    expect(second.sets).toEqual([]);

    const stack = await prisma.cardStack.findUniqueOrThrow({
      where: { userId_inseeCode: { userId, inseeCode: "T9001" } },
    });
    expect(stack.count).toBe(8);
    const stored = await prisma.booster.findUniqueOrThrow({
      where: { id: boosters[0]!.id },
    });
    expect(stored.newPositions).toEqual([0, 4]);
  });

  it("reports the progress of the sets that gained a commune", async () => {
    const userId = await createPlayer();
    await grantDailyBoosters(userId, DEPARTMENT);
    const { id } = await prisma.booster.findFirstOrThrow({ where: { userId } });
    const opened = await openStoredBooster(id, {
      userId,
      poolFor,
      random: firstPick,
    });
    expect(opened.sets).toContainEqual({
      slug: SET,
      type: "HOMONYMS",
      name: "Test",
      owned: 1,
      size: 3,
    });
  });

  it("stores a postcard as a unique copy, outside the normal stack", async () => {
    const userId = await createPlayer();
    await grantDailyBoosters(userId, DEPARTMENT);
    const { id } = await prisma.booster.findFirstOrThrow({ where: { userId } });
    // The last card is T9005, which has a postcard; `firstPick` makes every roll a success.
    const opened = await openStoredBooster(id, {
      userId,
      poolFor: async () => ({ all: pool.all, rarePlus: ["T9005"] }),
      random: firstPick,
    });
    expect(opened.cards[4]).toMatchObject({
      inseeCode: "T9005",
      variant: "postcard",
      isNew: true,
    });

    const instance = await prisma.cardInstance.findFirstOrThrow({
      where: { ownerId: userId },
    });
    expect(instance).toMatchObject({
      inseeCode: "T9005",
      variant: "POSTCARD",
      tier: "MYTHIQUE",
      boosterId: id,
    });
    const stack = await prisma.cardStack.findUniqueOrThrow({
      where: { userId_inseeCode: { userId, inseeCode: "T9005" } },
    });
    expect(stack.count).toBe(0);
  });
});

describe("openFreeBooster", () => {
  it("empties the stock, then refuses", async () => {
    const userId = await createPlayer();
    const now = new Date();
    for (let i = 0; i < FREE_BOOSTER_MAX; i++)
      await openFreeBooster({ userId, poolFor, now });
    await expect(
      openFreeBooster({ userId, poolFor, now }),
    ).rejects.toMatchObject({
      reason: "empty-stock",
    });
    expect(
      await prisma.booster.count({ where: { userId, kind: "FREE" } }),
    ).toBe(FREE_BOOSTER_MAX);
  });

  it("takes two boosters for two simultaneous openings", async () => {
    const userId = await createPlayer();
    const now = new Date();
    const results = await Promise.allSettled([
      openFreeBooster({ userId, poolFor, now }),
      openFreeBooster({ userId, poolFor, now }),
    ]);
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.boostersOpened).toBe(2);
  });
});

describe("account deletion", () => {
  it("removes the player's boosters and cards", async () => {
    const userId = await createPlayer();
    await openFreeBooster({ userId, poolFor, random: firstPick });
    await prisma.user.delete({ where: { id: userId } });
    expect(await prisma.booster.count({ where: { userId } })).toBe(0);
    expect(await prisma.cardStack.count({ where: { userId } })).toBe(0);
    expect(
      await prisma.cardInstance.count({ where: { ownerId: userId } }),
    ).toBe(0);
  });
});
