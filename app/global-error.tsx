"use client"; // Error boundaries must be Client Components

import "./globals.css";

// Replaces the root layout when the layout itself fails, so it renders its own <html> and <body>.
export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-sans">
        <title>Erreur · Patelin</title>
        <h1 className="text-3xl font-semibold">Oups, Patelin est en panne</h1>
        <p className="max-w-md text-muted">
          Une erreur inattendue s’est produite.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
