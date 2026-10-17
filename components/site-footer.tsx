import Link from "next/link";

const LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "Conditions d’utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export function SiteFooter() {
  return (
    // Bottom padding keeps the links clear of the mobile tab bar.
    <footer className="border-t border-border pb-20 md:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted md:flex-row md:justify-between">
        <nav
          aria-label="Informations légales"
          className="flex flex-wrap gap-x-4 gap-y-1"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p>Données : geo.api.gouv.fr · Photos : Wikimedia Commons</p>
      </div>
    </footer>
  );
}
