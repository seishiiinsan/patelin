"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { OpenedBooster } from "@/lib/boosters";
import {
  openBoosterAction,
  openFreeBoosterAction,
  type OpenBoosterResult,
} from "./actions";
import { BoosterReveal } from "./booster-reveal";

export type StoredBoosterOffer = {
  id: string;
  kind: "daily" | "department";
  title: string;
  subtitle: string;
};

type FreeOffer = {
  available: number;
  max: number;
  // When the next free booster arrives (ISO), or null with a full stock.
  nextAt: string | null;
  minutesLeft: number | null;
};

type PackTone = "free" | StoredBoosterOffer["kind"];

const PACK_COLORS: Record<PackTone, string> = {
  free: "var(--color-brand)",
  daily: "var(--color-accent)",
  department: "var(--color-tier-epique)",
};

function Pack({
  tone,
  shaking = false,
}: {
  tone: PackTone;
  shaking?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex aspect-[3/4] w-20 shrink-0 items-center justify-center rounded-xl shadow-md ${
        shaking ? "animate-booster-shake motion-reduce:animate-none" : ""
      }`}
      style={{
        backgroundColor: PACK_COLORS[tone],
        backgroundImage:
          "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.16) 0 6px, transparent 6px 14px)",
      }}
    >
      <span className="-rotate-12 rounded-md bg-white px-1.5 font-display text-sm font-semibold text-foreground">
        Patelin
      </span>
    </div>
  );
}

function OfferCard({
  tone,
  title,
  children,
  action,
}: {
  tone: PackTone;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
      <Pack tone={tone} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="font-display text-xl leading-tight font-semibold">
          {title}
        </h2>
        <div className="text-sm text-muted">{children}</div>
        <div className="mt-auto">{action}</div>
      </div>
    </li>
  );
}

const buttonClass =
  "rounded-full bg-accent px-5 py-2 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50";

export function BoosterShop({
  free,
  stored,
  departmentOfTheDay,
}: {
  free: FreeOffer;
  stored: StoredBoosterOffer[];
  departmentOfTheDay: { name: string; opened: boolean };
}) {
  const router = useRouter();
  const [opening, setOpening] = useState<PackTone | null>(null);
  const [opened, setOpened] = useState<OpenedBooster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Brings the new free booster in when it arrives.
  useEffect(() => {
    if (!free.nextAt || opened) return;
    const delay = Math.max(0, Date.parse(free.nextAt) - Date.now()) + 1_000;
    const timer = setTimeout(() => router.refresh(), delay);
    return () => clearTimeout(timer);
  }, [free.nextAt, opened, router]);

  function open(tone: PackTone, action: () => Promise<OpenBoosterResult>) {
    setError(null);
    setOpening(tone);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setOpened(result.booster);
      } else {
        setError(result.error);
        setOpening(null);
        router.refresh();
      }
    });
  }

  if (opened)
    return (
      <BoosterReveal
        booster={opened}
        onClose={() => {
          setOpened(null);
          setOpening(null);
          router.refresh();
        }}
      />
    );

  if (opening && pending)
    return (
      <div className="flex flex-col items-center gap-4 py-12" role="status">
        <Pack tone={opening} shaking />
        <p className="font-semibold">Ouverture du booster…</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-accent bg-surface p-4 font-semibold text-accent"
        >
          {error}
        </p>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        <OfferCard
          tone="free"
          title="Booster gratuit"
          action={
            <button
              type="button"
              className={buttonClass}
              disabled={free.available === 0 || pending}
              onClick={() => open("free", () => openFreeBoosterAction())}
            >
              Ouvrir
            </button>
          }
        >
          <p>
            <strong className="text-foreground">
              {free.available} / {free.max}
            </strong>{" "}
            en stock · 1 de plus chaque heure.
          </p>
          <p>
            {free.minutesLeft === null
              ? "Stock plein : le compteur repart quand tu en ouvres un."
              : `Le prochain arrive dans ${free.minutesLeft} min.`}
          </p>
        </OfferCard>

        {stored.map((booster) => (
          <OfferCard
            key={booster.id}
            tone={booster.kind}
            title={booster.title}
            action={
              <button
                type="button"
                className={buttonClass}
                disabled={pending}
                onClick={() =>
                  open(booster.kind, () => openBoosterAction(booster.id))
                }
              >
                Ouvrir
              </button>
            }
          >
            <p>{booster.subtitle}</p>
          </OfferCard>
        ))}
      </ul>

      {departmentOfTheDay.opened && (
        <p className="text-sm text-muted">
          Département du jour : {departmentOfTheDay.name}. Tu as déjà ouvert son
          booster, un autre département t’attend demain.
        </p>
      )}
    </div>
  );
}
