import type { Prisma } from "@/generated/prisma/client";
import { tierFromDb } from "./communes";
import type { TierKey } from "./tiers";

// Commune fields a card shows.
export const cardCommuneSelect = {
  inseeCode: true,
  name: true,
  departmentCode: true,
  department: { select: { name: true } },
  population: true,
  surfaceHa: true,
  tier: true,
  photoFile: true,
  photoThumbUrl: true,
  photoAuthor: true,
  photoLicense: true,
  photoLicenseUrl: true,
  postcardFile: true,
  postcardThumbUrl: true,
  postcardAuthor: true,
  postcardLicense: true,
} satisfies Prisma.CommuneSelect;

export type CardCommune = Prisma.CommuneGetPayload<{
  select: typeof cardCommuneSelect;
}>;

export type CardImage = {
  url: string;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
  // Commons file name, for the link to its page.
  file: string | null;
};

// What a card component needs: plain data, safe to pass to Client Components.
export type CardData = {
  inseeCode: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  population: number;
  surfaceHa: number;
  tier: TierKey;
  variant: "postcard" | null;
  // The photo, or the postcard of the postcard variant. Null: the cartoon fallback.
  image: CardImage | null;
};

export function toCardData(
  commune: CardCommune,
  variant: "postcard" | null = null,
): CardData {
  const image: CardImage | null =
    variant === "postcard" && commune.postcardThumbUrl
      ? {
          url: commune.postcardThumbUrl,
          author: commune.postcardAuthor,
          license: commune.postcardLicense,
          licenseUrl: null,
          file: commune.postcardFile,
        }
      : commune.photoThumbUrl
        ? {
            url: commune.photoThumbUrl,
            author: commune.photoAuthor,
            license: commune.photoLicense,
            licenseUrl: commune.photoLicenseUrl,
            file: commune.photoFile,
          }
        : null;

  return {
    inseeCode: commune.inseeCode,
    name: commune.name,
    departmentCode: commune.departmentCode,
    departmentName: commune.department.name,
    population: commune.population,
    surfaceHa: commune.surfaceHa,
    tier: tierFromDb(commune.tier).key,
    variant:
      variant === "postcard" && commune.postcardThumbUrl ? variant : null,
    image,
  };
}

// The Commons page of a file, where its full credit and license live.
export function commonsFileUrl(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(" ", "_"))}`;
}
