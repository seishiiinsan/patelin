import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DeleteAccount,
  SignOutButton,
} from "@/components/auth/account-actions";
import { isEstablished, missingForEstablished } from "@/lib/eligibility";
import { requirePlayer } from "@/lib/session";

export const metadata: Metadata = { title: "Profil" };

async function ProfileDetails() {
  const user = await requirePlayer();
  const now = new Date();
  const established = isEstablished(user, now);
  const missing = missingForEstablished(user, now);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold text-brand">
          {user.pseudo}
        </h1>
        <p className="text-muted">
          Membre depuis le{" "}
          {user.createdAt.toLocaleDateString("fr-FR", {
            dateStyle: "long",
            timeZone: "Europe/Paris",
          })}
        </p>
      </section>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <dt className="text-sm text-muted">Boosters ouverts</dt>
          <dd className="font-display text-3xl font-semibold">
            {user.boostersOpened}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <dt className="text-sm text-muted">Compte établi</dt>
          <dd className="font-semibold">
            {established
              ? "Oui : échanges et classement du Patelin du jour ouverts."
              : `Encore ${missing.days} jour${missing.days > 1 ? "s" : ""} et ${missing.boosters} booster${missing.boosters > 1 ? "s" : ""} pour pouvoir échanger.`}
          </dd>
        </div>
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Mon compte</h2>
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <a
            href="/api/compte/export"
            download
            className="rounded-full border border-border bg-surface px-5 py-2 font-semibold"
          >
            Exporter mes données
          </a>
        </div>
        <DeleteAccount pseudo={user.pseudo} />
      </section>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement…</p>}>
      <ProfileDetails />
    </Suspense>
  );
}
