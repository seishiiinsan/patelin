"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardBack } from "@/components/card-back";
import { CommuneCard } from "@/components/commune-card";
import type { OpenedBooster, OpenedCard } from "@/lib/boosters";
import { formatSetProgress } from "@/lib/set-progress";
import { TIERS } from "@/lib/tiers";

// Pause between two cards when the player asks to turn them all over.
const AUTO_REVEAL_MS = 450;

function FlipCard({
  card,
  position,
  flipped,
  canFlip,
  last,
  onFlip,
}: {
  card: OpenedCard;
  position: number;
  flipped: boolean;
  canFlip: boolean;
  last: boolean;
  onFlip: () => void;
}) {
  return (
    <li
      className={`relative perspective-[1200px] ${last ? "col-span-2 mx-auto w-1/2 sm:col-span-1 sm:w-full" : ""}`}
    >
      {/* The guaranteed Rare-or-better card lights up in its tier color. */}
      {last && (
        <div
          aria-hidden="true"
          className={`absolute -inset-2 rounded-3xl blur-xl transition-opacity duration-700 motion-reduce:transition-none ${
            flipped ? "opacity-70" : "opacity-0"
          }`}
          style={{ backgroundColor: `var(--color-tier-${card.tier})` }}
        />
      )}
      <div
        className={`relative transition-transform duration-500 transform-3d motion-reduce:transition-none ${
          flipped ? "rotate-y-180" : ""
        } ${flipped && last ? "animate-card-pop motion-reduce:animate-none" : ""}`}
      >
        <button
          type="button"
          onClick={onFlip}
          disabled={!canFlip}
          aria-label={`Retourner la carte ${position}`}
          className={`block w-full rounded-[6%] backface-hidden ${
            canFlip ? "cursor-pointer" : "cursor-default"
          } ${canFlip ? "ring-4 ring-accent/60" : ""}`}
        >
          <CardBack />
        </button>
        <div
          className="absolute inset-0 rotate-y-180 backface-hidden"
          aria-hidden={!flipped}
        >
          <CommuneCard
            card={card}
            isNew={card.isNew}
            sizes="(min-width: 640px) 190px, 45vw"
            priority
          />
        </div>
      </div>
    </li>
  );
}

function Summary({ booster }: { booster: OpenedBooster }) {
  const newCount = booster.cards.filter((card) => card.isNew).length;
  const postcards = booster.cards.filter(
    (card) => card.variant === "postcard",
  ).length;

  return (
    <section
      aria-label="Résumé du booster"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
    >
      <ul className="flex flex-wrap gap-2">
        <li className="rounded-full bg-accent px-3 py-1 font-semibold text-white">
          {newCount === 0
            ? "Aucune nouvelle commune"
            : `+${newCount} nouvelle${newCount > 1 ? "s" : ""}`}
        </li>
        {booster.sets.map((set) => (
          <li
            key={set.slug}
            className="rounded-full border border-border px-3 py-1"
          >
            {set.name}{" "}
            <strong className="font-semibold">{formatSetProgress(set)}</strong>
          </li>
        ))}
      </ul>
      {postcards > 0 && (
        <p className="text-sm">
          {postcards > 1
            ? `${postcards} cartes postales anciennes !`
            : "Une carte postale ancienne !"}{" "}
          Elle rejoint ta collection comme exemplaire unique.
        </p>
      )}
    </section>
  );
}

export function BoosterReveal({
  booster,
  onClose,
}: {
  booster: OpenedBooster;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const [auto, setAuto] = useState(false);
  const total = booster.cards.length;
  const done = revealed === total;

  // "Tout retourner" still turns the cards one by one, the last one last.
  useEffect(() => {
    if (!auto || done) return;
    const timer = setTimeout(
      () => setRevealed((count) => count + 1),
      AUTO_REVEAL_MS,
    );
    return () => clearTimeout(timer);
  }, [auto, done, revealed]);

  const latest = revealed > 0 ? booster.cards[revealed - 1] : undefined;
  const latestTier = latest && TIERS.find((t) => t.key === latest.tier);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">
          {done
            ? "Toutes les cartes sont retournées."
            : "Touche la carte entourée pour la retourner."}
        </p>
        {!done && (
          <button
            type="button"
            onClick={() => setAuto(true)}
            disabled={auto}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Tout retourner
          </button>
        )}
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        {booster.cards.map((card, index) => (
          <FlipCard
            key={index}
            card={card}
            position={index + 1}
            flipped={index < revealed}
            canFlip={index === revealed && !auto}
            last={index === total - 1}
            onFlip={() => setRevealed(index + 1)}
          />
        ))}
      </ol>

      <p aria-live="polite" className="sr-only">
        {latest &&
          `Carte ${revealed} : ${latest.name}, ${latestTier?.label ?? ""}${latest.isNew ? ", nouvelle" : ""}`}
      </p>

      {done && (
        <>
          <Summary booster={booster} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-sm"
            >
              Ouvrir un autre booster
            </button>
            <Link
              href="/collection"
              className="rounded-full border border-border bg-surface px-6 py-3 font-semibold"
            >
              Voir ma collection
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
