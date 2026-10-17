import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Commune" };

async function getCommune(inseeCode: string) {
  "use cache";
  cacheLife("hours");
  return prisma.commune.findUnique({
    where: { inseeCode },
    include: { department: { select: { name: true } } },
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
    <article className="flex max-w-md flex-col gap-4">
      <h1 className="font-display text-3xl font-semibold">{commune.name}</h1>
      <p className="text-muted">
        {commune.department.name} · {commune.population.toLocaleString("fr-FR")}{" "}
        hab. · {commune.tier} · rayon {commune.radiusKm.toFixed(2)} km
      </p>
      {commune.photoThumbUrl ? (
        <figure className="flex flex-col gap-1">
          <Image
            src={commune.photoThumbUrl}
            alt={`Photo de ${commune.name}`}
            width={640}
            height={480}
            className="h-auto w-full rounded-2xl"
          />
          <figcaption className="text-xs text-muted">
            {commune.photoAuthor ?? "Auteur inconnu"} · {commune.photoLicense} ·
            Wikimedia Commons
          </figcaption>
        </figure>
      ) : (
        <p className="text-muted">
          Pas de photo : visuel de repli à venir (phase 3).
        </p>
      )}
      {commune.postcardThumbUrl && (
        <figure className="flex flex-col gap-1">
          <Image
            src={commune.postcardThumbUrl}
            alt={`Carte postale ancienne de ${commune.name}`}
            width={640}
            height={480}
            className="h-auto w-full rounded-2xl"
          />
          <figcaption className="text-xs text-muted">
            Carte postale ancienne · {commune.postcardLicense}
          </figcaption>
        </figure>
      )}
    </article>
  );
}

// Development-only page that previews the imported data of one commune.
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
