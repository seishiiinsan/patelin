import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CommuneCard } from "@/components/commune-card";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { getCollectionPage, getCollectionTotals } from "@/lib/collection";
import {
  COLLECTION_PAGE_SIZE,
  parseCollectionFilters,
  type CollectionFilters,
} from "@/lib/collection-filters";
import { getGeography } from "@/lib/geography";
import { getCurrentUser } from "@/lib/session";
import { TIERS } from "@/lib/tiers";
import { FilterSelect } from "./filter-select";

export const metadata: Metadata = { title: "Collection" };

const fieldClass =
  "h-11 rounded-xl border border-border bg-surface px-3 text-foreground";
const selectClass = `${fieldClass} min-w-0 text-sm`;

const plural = (count: number, word: string) =>
  `${count.toLocaleString("fr-FR")} ${word}${count > 1 ? "s" : ""}`;

function pageHref(filters: CollectionFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tier) params.set("tier", filters.tier);
  if (filters.region) params.set("region", filters.region);
  if (filters.department) params.set("departement", filters.department);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/collection?${query}` : "/collection";
}

async function Filters({ filters }: { filters: CollectionFilters }) {
  const { regions, departments } = await getGeography();
  return (
    // Keyed by the filters, so that the fields show the current ones after each navigation.
    <Form
      key={JSON.stringify(filters)}
      action="/collection"
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Rechercher une commune"
          aria-label="Rechercher une commune"
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-brand px-5 font-semibold text-brand-ink"
        >
          Chercher
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <FilterSelect
          name="tier"
          defaultValue={filters.tier ?? ""}
          aria-label="Tier"
          className={selectClass}
        >
          <option value="">Tier</option>
          {TIERS.map((tier) => (
            <option key={tier.key} value={tier.key}>
              {tier.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          name="region"
          defaultValue={filters.region ?? ""}
          aria-label="Région"
          className={selectClass}
        >
          <option value="">Région</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          name="departement"
          defaultValue={filters.department ?? ""}
          aria-label="Département"
          className={selectClass}
        >
          <option value="">Département</option>
          {departments.map((department) => (
            <option key={department.code} value={department.code}>
              {department.code} · {department.name}
            </option>
          ))}
        </FilterSelect>
      </div>
    </Form>
  );
}

async function Collection({
  searchParams,
}: {
  searchParams: PageProps<"/collection">["searchParams"];
}) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <SignInPrompt>
        Connecte-toi pour retrouver ta collection de communes.
      </SignInPrompt>
    );
  if (!user.pseudo) redirect("/bienvenue");

  const filters = parseCollectionFilters(await searchParams);
  const [totals, { total, entries }, { activeCommunes }] = await Promise.all([
    getCollectionTotals(user.id),
    getCollectionPage(user.id, filters),
    getGeography(),
  ]);

  if (totals.communes === 0)
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
        <p className="text-muted">
          Ta collection est vide pour l’instant. Ouvre ton premier booster pour
          découvrir tes 5 premières communes.
        </p>
        <Link
          href="/boosters"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white"
        >
          Ouvrir un booster
        </Link>
      </div>
    );

  const pages = Math.max(1, Math.ceil(total / COLLECTION_PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        <strong className="text-foreground">
          {plural(totals.communes, "commune")}
        </strong>{" "}
        sur {activeCommunes.toLocaleString("fr-FR")} ·{" "}
        {plural(totals.cards, "carte")}
      </p>

      <Filters filters={filters} />

      {entries.length === 0 ? (
        <p className="py-8 text-center text-muted">
          Aucune de tes cartes ne correspond à ces filtres.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">
            {plural(total, "commune")}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {entries.map(({ card, normal, unique }) => (
              <li key={card.inseeCode} className="flex flex-col gap-1">
                <Link
                  href={`/collection/${card.inseeCode}`}
                  className="rounded-[6%] transition-transform hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-brand"
                >
                  <CommuneCard
                    card={card}
                    sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 45vw"
                  />
                </Link>
                <p className="text-center text-sm text-muted">
                  {[
                    normal > 0 && `×${normal}`,
                    unique > 0 && plural(unique, "unique"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {pages > 1 && (
        <nav
          aria-label="Pages de la collection"
          className="flex items-center justify-center gap-4"
        >
          {filters.page > 1 && (
            <Link
              href={pageHref(filters, filters.page - 1)}
              className="rounded-full border border-border bg-surface px-4 py-2 font-semibold"
            >
              Précédente
            </Link>
          )}
          <span className="text-sm text-muted">
            Page {filters.page} sur {pages}
          </span>
          {filters.page < pages && (
            <Link
              href={pageHref(filters, filters.page + 1)}
              className="rounded-full border border-border bg-surface px-4 py-2 font-semibold"
            >
              Suivante
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export default function CollectionPage({
  searchParams,
}: PageProps<"/collection">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Collection</h1>
      <Suspense fallback={<p className="text-muted">Chargement…</p>}>
        <Collection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
