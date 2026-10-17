import type { Prisma } from "@/generated/prisma/client";
import { setProgress } from "./boosters";
import { cardCommuneSelect, toCardData, type CardData } from "./cards";
import { dbTierForKey } from "./communes";
import { prisma } from "./prisma";
import {
  COLLECTION_PAGE_SIZE,
  type CollectionFilters,
} from "./collection-filters";
import { searchKey } from "./search";

// The player owns a commune when they hold a normal card or a unique copy of it.
function owned(userId: string): Prisma.CommuneWhereInput {
  return {
    OR: [
      { cardStacks: { some: { userId, count: { gt: 0 } } } },
      { cardInstances: { some: { ownerId: userId } } },
    ],
  };
}

export type CollectionEntry = {
  card: CardData;
  // Normal (interchangeable) cards, and unique copies.
  normal: number;
  unique: number;
};

export async function getCollectionPage(
  userId: string,
  filters: CollectionFilters,
): Promise<{ total: number; entries: CollectionEntry[] }> {
  const key = searchKey(filters.q);
  const where: Prisma.CommuneWhereInput = {
    AND: [
      owned(userId),
      filters.tier ? { tier: dbTierForKey(filters.tier) } : {},
      filters.region ? { regionCode: filters.region } : {},
      filters.department ? { departmentCode: filters.department } : {},
      key ? { searchName: { contains: key } } : {},
    ],
  };

  const [total, communes] = await Promise.all([
    prisma.commune.count({ where }),
    prisma.commune.findMany({
      where,
      orderBy: [{ searchName: "asc" }, { inseeCode: "asc" }],
      skip: (filters.page - 1) * COLLECTION_PAGE_SIZE,
      take: COLLECTION_PAGE_SIZE,
      select: {
        ...cardCommuneSelect,
        cardStacks: { where: { userId }, select: { count: true } },
        _count: {
          select: { cardInstances: { where: { ownerId: userId } } },
        },
      },
    }),
  ]);

  return {
    total,
    entries: communes.map((commune) => ({
      card: toCardData(commune),
      normal: commune.cardStacks[0]?.count ?? 0,
      unique: commune._count.cardInstances,
    })),
  };
}

// How many communes the player owns, and how many cards in all.
export async function getCollectionTotals(userId: string) {
  const [communes, normal, unique] = await Promise.all([
    prisma.commune.count({ where: owned(userId) }),
    prisma.cardStack.aggregate({ where: { userId }, _sum: { count: true } }),
    prisma.cardInstance.count({ where: { ownerId: userId } }),
  ]);
  return { communes, cards: (normal._sum.count ?? 0) + unique };
}

// Everything the detail page shows about one of the player's communes, or null when they do
// not own it: the page then does not even reveal the commune's name.
export async function getCollectionCard(userId: string, inseeCode: string) {
  const commune = await prisma.commune.findUnique({
    where: { inseeCode },
    select: {
      ...cardCommuneSelect,
      cardStacks: {
        where: { userId },
        select: { count: true, firstObtainedAt: true },
      },
      cardInstances: {
        where: { ownerId: userId },
        orderBy: { obtainedAt: "asc" },
        select: { id: true, variant: true, obtainedAt: true },
      },
    },
  });
  if (!commune) return null;
  const stack = commune.cardStacks[0];
  const normal = stack?.count ?? 0;
  if (normal === 0 && commune.cardInstances.length === 0) return null;

  return {
    card: toCardData(commune),
    normal,
    firstObtainedAt: stack?.firstObtainedAt ?? null,
    instances: commune.cardInstances.map((instance) => ({
      id: instance.id,
      obtainedAt: instance.obtainedAt,
      card: toCardData(
        commune,
        instance.variant === "POSTCARD" ? "postcard" : null,
      ),
    })),
    sets: await setProgress(prisma, userId, [inseeCode]),
  };
}
