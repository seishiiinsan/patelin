"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useHydrated } from "@/lib/use-hydrated";
import type { SocialProvider } from "@/lib/auth";

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "Continuer avec Google",
  discord: "Continuer avec Discord",
};

export function SignInOptions({
  providers,
  devLogin,
}: {
  providers: SocialProvider[];
  devLogin: boolean;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() =>
            authClient.signIn.social({
              provider,
              callbackURL: "/profil",
              newUserCallbackURL: "/bienvenue",
            })
          }
          className="rounded-full border border-border bg-surface px-6 py-3 font-semibold"
        >
          {PROVIDER_LABELS[provider]}
        </button>
      ))}
      {providers.length === 0 && !devLogin && (
        <p className="text-muted">La connexion n’est pas encore configurée.</p>
      )}
      {devLogin && <DevLoginForm />}
    </div>
  );
}

// Development only: signs in with an email and password, creating the account if needed.
function DevLoginForm() {
  const hydrated = useHydrated();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    setPending(true);
    setError(null);

    const signIn = await authClient.signIn.email({ email, password });
    // 401: no account with these credentials yet, so create it.
    const result =
      signIn.error?.status === 401
        ? await authClient.signUp.email({ email, password, name: email })
        : signIn;
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Connexion impossible.");
      return;
    }
    // A full page load: the client router may hold a stale prefetch of /profil from before
    // the sign-in, when the proxy still redirected it to /connexion.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load on purpose, see above
    window.location.assign("/profil");
  }

  return (
    <form
      action={submit}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4"
    >
      <p className="text-sm font-semibold text-muted">
        Connexion de développement
      </p>
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Mot de passe (8 caractères minimum)
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-lg border border-border bg-surface px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={!hydrated || pending}
        className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink disabled:opacity-60"
      >
        Se connecter
      </button>
    </form>
  );
}
