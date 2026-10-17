import type { Tier as DbTier } from "@/generated/prisma/enums";
import { searchKey } from "./search";
import { TIERS, tierForPopulation, type Tier, type TierKey } from "./tiers";

// Overseas departments (DROM) kept in the game; other overseas collectivities are left out.
export const DROM_CODES = new Set(["971", "972", "973", "974", "976"]);

// Placement tiers are multiples of the equivalent radius, never smaller than this.
export const MIN_RADIUS_KM = 1.5;

export function isInPerimeter(departmentCode: string): boolean {
  return departmentCode.length === 2 || DROM_CODES.has(departmentCode);
}

// Radius of a disc with the commune's surface: r = √(surface / π), floored at MIN_RADIUS_KM.
export function equivalentRadiusKm(surfaceHa: number): number {
  const surfaceKm2 = surfaceHa / 100;
  return Math.max(MIN_RADIUS_KM, Math.sqrt(surfaceKm2 / Math.PI));
}

const DB_TIERS: Record<TierKey, DbTier> = {
  commune: "COMMUNE",
  "peu-commune": "PEU_COMMUNE",
  rare: "RARE",
  epique: "EPIQUE",
  legendaire: "LEGENDAIRE",
  mythique: "MYTHIQUE",
};

export function dbTierForPopulation(population: number): DbTier {
  return DB_TIERS[tierForPopulation(population).key];
}

export function dbTierForKey(key: TierKey): DbTier {
  return DB_TIERS[key];
}

// Label and color key of a tier stored in the database.
export function tierFromDb(dbTier: DbTier): Tier {
  return TIERS.find((tier) => DB_TIERS[tier.key] === dbTier) ?? TIERS[0];
}

// Shape returned by geo.api.gouv.fr/communes with the fields the import asks for.
export type GeoApiCommune = {
  code: string;
  nom: string;
  codeDepartement?: string;
  codeRegion?: string;
  population?: number;
  surface?: number;
  centre?: { type: "Point"; coordinates: [number, number] };
};

export type CommuneRow = {
  inseeCode: string;
  name: string;
  searchName: string;
  departmentCode: string;
  regionCode: string;
  population: number;
  surfaceHa: number;
  latitude: number;
  longitude: number;
  radiusKm: number;
  tier: DbTier;
};

// Turns an API record into a database row, or null when it is outside the game's perimeter
// or misses data a card needs.
export function toCommuneRow(raw: GeoApiCommune): CommuneRow | null {
  const { codeDepartement, codeRegion, population, surface, centre } = raw;
  if (!codeDepartement || !codeRegion || !isInPerimeter(codeDepartement))
    return null;
  if (population === undefined || surface === undefined || !centre) return null;

  const [longitude, latitude] = centre.coordinates;
  return {
    inseeCode: raw.code,
    name: raw.nom,
    searchName: searchKey(raw.nom),
    departmentCode: codeDepartement,
    regionCode: codeRegion,
    population,
    surfaceHa: surface,
    latitude,
    longitude,
    radiusKm: equivalentRadiusKm(surface),
    tier: dbTierForPopulation(population),
  };
}
