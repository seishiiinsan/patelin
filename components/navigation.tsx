"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/boosters", label: "Boosters" },
  { href: "/collection", label: "Collection" },
  { href: "/market", label: "Market" },
  { href: "/profil", label: "Profil" },
] as const;

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Desktop: links in the header. Mobile: a tab bar fixed at the bottom of the screen.
// `pathname` null renders it with no active tab: the prerendered shell, before the URL is known.
export function NavigationLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent md:pb-0"
    >
      <ul className="grid grid-cols-5 md:flex md:gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 items-center justify-center text-sm font-semibold transition-colors md:h-auto md:rounded-full md:px-4 md:py-2 ${
                  active
                    ? "text-brand md:bg-brand md:text-brand-ink"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Highlights the current section. usePathname() is request data, so render it under <Suspense>.
export function Navigation() {
  return <NavigationLinks pathname={usePathname()} />;
}
