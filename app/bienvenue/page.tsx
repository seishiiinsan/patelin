import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PseudoForm } from "@/components/auth/pseudo-form";
import { requireSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Bienvenue" };

async function ChoosePseudo() {
  const user = await requireSignedIn();
  if (user.pseudo) redirect("/profil");
  return <PseudoForm />;
}

// First stop after the first sign-in: every player needs a public pseudo.
export default function BienvenuePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <h1 className="font-display text-3xl font-semibold">
        Bienvenue à Patelin
      </h1>
      <p className="max-w-sm text-muted">
        Choisis le nom sous lequel les autres joueurs te verront.
      </p>
      <Suspense fallback={<p className="text-muted">Chargement…</p>}>
        <ChoosePseudo />
      </Suspense>
    </div>
  );
}
