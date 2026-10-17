import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CommuneCard } from "@/components/commune-card";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { commonsFileUrl, type CardImage } from "@/lib/cards";
import { getCollectionCard } from "@/lib/collection";
import { formatSetProgress } from "@/lib/set-progress";
import { getCurrentUser } from "@/lib/session";

// A static title: a dynamic one would give away the name of a commune the player does not own.
export const metadata: Metadata = { title: "Carte" };

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  });

function Credit({ image, label }: { image: CardImage; label: string }) {
  return (
    <p className="text-sm text-muted">
      {label} : {image.author ?? "auteur inconnu"}
      {image.license && (
        <>
          {" · "}
          {image.licenseUrl ? (
            <a href={image.licenseUrl} className="underline">
              {image.license}
            </a>
          ) : (
            image.license
          )}
        </>
      )}
      {image.file && (
        <>
          {" · "}
          <a href={commonsFileUrl(image.file)} className="underline">
            Wikimedia Commons
          </a>
        </>
      )}
    </p>
  );
}

async function CardDetails({
  params,
}: {
  params: PageProps<"/collection/[insee]">["params"];
}) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <SignInPrompt>
        Connecte-toi pour voir les cartes de ta collection.
      </SignInPrompt>
    );
  if (!user.pseudo) redirect("/bienvenue");

  const { insee } = await params;
  const details = await getCollectionCard(user.id, insee);
  if (!details) notFound();
  const { card, normal, instances, sets, firstObtainedAt } = details;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="mx-auto w-full max-w-72 md:max-w-none">
        <CommuneCard
          card={card}
          sizes="(min-width: 768px) 320px, 288px"
          priority
        />
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold">{card.name}</h1>
          <p className="text-muted">
            {card.departmentName} ({card.departmentCode})
            {firstObtainedAt &&
              ` · dans ta collection depuis le ${formatDate(firstObtainedAt)}`}
          </p>
          {card.image ? (
            <Credit image={card.image} label="Photo" />
          ) : (
            <p className="text-sm text-muted">
              Pas encore de photo libre de droits : illustration Patelin.
            </p>
          )}
        </section>

        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dt className="text-sm text-muted">Exemplaires normaux</dt>
            <dd className="font-display text-3xl font-semibold">{normal}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dt className="text-sm text-muted">Exemplaires uniques</dt>
            <dd className="font-display text-3xl font-semibold">
              {instances.length}
            </dd>
          </div>
        </dl>

        {instances.length === 0 ? (
          <p className="text-sm text-muted">
            Pas encore d’exemplaire unique. Les cartes décorées par un placement
            et les cartes postales anciennes en sont.
          </p>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">
              Tes exemplaires uniques
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {instances.map((instance) => (
                <li key={instance.id} className="flex flex-col gap-2">
                  <CommuneCard
                    card={instance.card}
                    sizes="(min-width: 640px) 200px, 45vw"
                  />
                  <p className="text-sm">
                    <strong>
                      {instance.card.variant === "postcard"
                        ? "Carte postale ancienne"
                        : "Décorée"}
                    </strong>
                    <br />
                    <span className="text-muted">
                      Obtenue le {formatDate(instance.obtainedAt)}
                    </span>
                  </p>
                  {instance.card.image &&
                    instance.card.variant === "postcard" && (
                      <Credit
                        image={instance.card.image}
                        label="Carte postale"
                      />
                    )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {sets.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Sets</h2>
            <ul className="flex flex-wrap gap-2">
              {sets.map((set) => (
                <li
                  key={set.slug}
                  className="rounded-full border border-border bg-surface px-3 py-1"
                >
                  {set.name}{" "}
                  <strong className="font-semibold">
                    {formatSetProgress(set)}
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default function CollectionCardPage({
  params,
}: PageProps<"/collection/[insee]">) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/collection"
        className="self-start text-sm font-semibold text-brand"
      >
        ← Collection
      </Link>
      <Suspense fallback={<p className="text-muted">Chargement…</p>}>
        <CardDetails params={params} />
      </Suspense>
    </div>
  );
}
