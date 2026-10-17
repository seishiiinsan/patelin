"use server";

import {
  BoosterError,
  openFreeBooster,
  openStoredBooster,
  type BoosterFailure,
  type OpenedBooster,
} from "@/lib/boosters";
import { getDrawPool } from "@/lib/draw-pools";
import { logger } from "@/lib/logger";
import { requirePlayer } from "@/lib/session";

export type OpenBoosterResult =
  { ok: true; booster: OpenedBooster } | { ok: false; error: string };

const MESSAGES: Record<BoosterFailure, string> = {
  "not-found": "Ce booster est introuvable.",
  "already-opened": "Ce booster a déjà été ouvert.",
  "empty-stock":
    "Plus de booster gratuit pour l’instant : le prochain arrive bientôt.",
};

async function open(
  source: string,
  run: (userId: string) => Promise<OpenedBooster>,
): Promise<OpenBoosterResult> {
  const player = await requirePlayer();
  try {
    const booster = await run(player.id);
    logger.info(
      { userId: player.id, boosterId: booster.boosterId, source },
      "booster opened",
    );
    return { ok: true, booster };
  } catch (error) {
    if (!(error instanceof BoosterError)) throw error;
    logger.warn(
      { userId: player.id, source, reason: error.reason },
      "booster refused",
    );
    return { ok: false, error: MESSAGES[error.reason] };
  }
}

export async function openFreeBoosterAction(): Promise<OpenBoosterResult> {
  return open("free", (userId) =>
    openFreeBooster({ userId, poolFor: getDrawPool }),
  );
}

export async function openBoosterAction(
  boosterId: unknown,
): Promise<OpenBoosterResult> {
  if (typeof boosterId !== "string" || boosterId.length > 64)
    return { ok: false, error: MESSAGES["not-found"] };
  return open("stored", (userId) =>
    openStoredBooster(boosterId, { userId, poolFor: getDrawPool }),
  );
}
