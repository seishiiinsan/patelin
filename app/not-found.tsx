import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">
        Ce patelin n’existe pas
      </h1>
      <p className="text-muted">La page demandée est introuvable.</p>
      <Link
        href="/"
        className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
