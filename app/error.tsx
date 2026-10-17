"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // Server errors are already logged by instrumentation.ts; this catches client-side ones.
    console.error(error);
  }, [error]);

  // Matches the server log entry for errors thrown in Server Components.
  const digest =
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined;

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">
        Oups, la route est coupée
      </h1>
      <p className="max-w-md text-muted">
        Une erreur inattendue s’est produite. Réessaie dans un instant.
      </p>
      {digest && <p className="text-xs text-muted">Référence : {digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink"
      >
        Réessayer
      </button>
    </div>
  );
}
