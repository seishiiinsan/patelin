import Link from "next/link";

// Shown in place of a player's own content to a visitor who is not signed in.
export function SignInPrompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
      <p className="max-w-sm text-muted">{children}</p>
      <Link
        href="/connexion"
        className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink"
      >
        Se connecter
      </Link>
    </div>
  );
}
