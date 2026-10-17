import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { grantDailyBoosters, unopenedBoosters } from "@/lib/boosters";
import { getDepartmentOfTheDay } from "@/lib/draw-pools";
import { FREE_BOOSTER_MAX, freeBoosterStock } from "@/lib/free-boosters";
import { parisDay, parisDayDate } from "@/lib/game-day";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BoosterShop, type StoredBoosterOffer } from "./booster-shop";

export const metadata: Metadata = { title: "Boosters" };

const formatDay = (day: Date) =>
  day.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

async function Offer() {
  const user = await getCurrentUser();
  if (!user)
    return (
      <SignInPrompt>
        Connecte-toi pour ouvrir tes boosters : un gratuit toutes les heures, et
        deux de plus chaque jour.
      </SignInPrompt>
    );
  if (!user.pseudo) redirect("/bienvenue");

  const now = new Date();
  const today = parisDayDate(now);
  const departmentOfTheDay = await getDepartmentOfTheDay(parisDay(now));
  // The first visit of the day brings the daily boosters.
  await grantDailyBoosters(user.id, departmentOfTheDay.code, now);

  const [boosters, clock, departments] = await Promise.all([
    unopenedBoosters(user.id),
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { freeBoostersFrom: true },
    }),
    prisma.department.findMany({ select: { code: true, name: true } }),
  ]);
  const departmentName = new Map(departments.map((d) => [d.code, d.name]));
  const stock = freeBoosterStock(clock.freeBoostersFrom, now);

  const stored: StoredBoosterOffer[] = boosters.map((booster) => {
    const isToday = booster.day?.getTime() === today.getTime();
    const when = booster.day && !isToday ? ` du ${formatDay(booster.day)}` : "";
    if (booster.kind === "DEPARTMENT" && booster.departmentCode)
      return {
        id: booster.id,
        kind: "department",
        title: departmentName.get(booster.departmentCode) ?? "Département",
        subtitle: `Département ${isToday ? "du jour" : when.trim()} : 5 cartes de ce département`,
      };
    return {
      id: booster.id,
      kind: "daily",
      title: `Booster du jour${when}`,
      subtitle: "Offert à ta première visite de la journée",
    };
  });

  return (
    <BoosterShop
      free={{
        available: stock.available,
        max: FREE_BOOSTER_MAX,
        nextAt: stock.nextAt?.toISOString() ?? null,
        minutesLeft: stock.nextAt
          ? Math.ceil((stock.nextAt.getTime() - now.getTime()) / 60_000)
          : null,
      }}
      stored={stored}
      departmentOfTheDay={{
        name: departmentOfTheDay.name,
        opened: !boosters.some(
          (b) =>
            b.kind === "DEPARTMENT" && b.day?.getTime() === today.getTime(),
        ),
      }}
    />
  );
}

export default function BoostersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Boosters</h1>
      <Suspense fallback={<p className="text-muted">Chargement…</p>}>
        <Offer />
      </Suspense>
    </div>
  );
}
