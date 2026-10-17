import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInOptions } from "@/components/auth/sign-in-options";
import { devLoginEnabled, socialProviders } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Connexion" };

// Already signed in: straight to the profile.
async function RedirectSignedIn() {
  if (await getCurrentUser()) redirect("/profil");
  return null;
}

export default function ConnexionPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <Suspense>
        <RedirectSignedIn />
      </Suspense>
      <h1 className="font-display text-3xl font-semibold">Connexion</h1>
      <p className="max-w-sm text-muted">
        Connecte-toi pour ouvrir tes boosters et commencer ta collection.
      </p>
      <SignInOptions providers={socialProviders} devLogin={devLoginEnabled} />
    </div>
  );
}
