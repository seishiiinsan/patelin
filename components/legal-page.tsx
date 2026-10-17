import type { ReactNode } from "react";

// Shared layout of the legal pages: title, last update and readable prose.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="text-sm text-muted">Dernière mise à jour : {updated}</p>
      {children}
    </article>
  );
}
