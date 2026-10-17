import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CommuneCard } from "@/components/commune-card";
import { cardCommuneSelect, toCardData } from "@/lib/cards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Commune" };

async function getCommune(inseeCode: string) {
  "use cache";
  cacheLife("hours");
  return prisma.commune.findUnique({
    where: { inseeCode },
    select: { ...cardCommuneSelect, radiusKm: true },
  });
}

async function CommuneDetails({
  params,
}: {
  params: Promise<{ insee: string }>;
}) {
  const { insee } = await params;
  const commune = await getCommune(insee);
  if (!commune) notFound();

  return (
    <article className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-semibold">{commune.name}</h1>
      <p className="text-muted">
        {commune.department.name} · {commune.population.toLocaleString("fr-FR")}{" "}
        hab. · {commune.tier} · rayon {commune.radiusKm.toFixed(2)} km
      </p>
      {/* The card at the narrowest phone width, then as on desktop, then its postcard variant. */}
      <div className="flex flex-wrap items-start gap-6">
        <div className="w-[165px]">
          <CommuneCard card={toCardData(commune)} sizes="165px" isNew />
        </div>
        <div className="w-[300px]">
          <CommuneCard card={toCardData(commune)} sizes="300px" />
        </div>
        {commune.postcardThumbUrl && (
          <div className="w-[300px]">
            <CommuneCard card={toCardData(commune, "postcard")} sizes="300px" />
          </div>
        )}
      </div>
    </article>
  );
}

// Development-only page that previews the card of one commune.
export default function DevCommunePage({
  params,
}: {
  params: Promise<{ insee: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={<p className="text-muted">Chargement…</p>}>
      <CommuneDetails params={params} />
    </Suspense>
  );
}
