import Link from "next/link";
import { Suspense } from "react";
import { Navigation, NavigationLinks } from "./navigation";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-2xl font-semibold text-brand"
        >
          Patelin
        </Link>
        <Suspense fallback={<NavigationLinks pathname={null} />}>
          <Navigation />
        </Suspense>
      </div>
    </header>
  );
}
