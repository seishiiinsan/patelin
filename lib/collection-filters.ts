import { TIERS, type TierKey } from "./tiers";

export const COLLECTION_PAGE_SIZE = 48;

export type CollectionFilters = {
  q: string;
  tier: TierKey | null;
  region: string | null;
  department: string | null;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

// Reads the filters of the collection page from its URL. Unknown values are ignored.
export function parseCollectionFilters(
  params: SearchParams,
): CollectionFilters {
  const tier = first(params.tier);
  const code = /^[0-9AB]{2,3}$/;
  const region = first(params.region);
  const department = first(params.departement);
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).slice(0, 80),
    tier: TIERS.some((t) => t.key === tier) ? (tier as TierKey) : null,
    region: /^\d{2}$/.test(region) ? region : null,
    department: code.test(department) ? department : null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}
