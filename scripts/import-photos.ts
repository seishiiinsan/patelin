// Links each commune to its Wikidata photo (P18) and Commons category (P373), then fetches
// the thumbnail URL and credits of every photo not resolved yet. Safe to run again: it resumes
// where it stopped and only refetches photos that changed on Wikidata.
// Usage: npm run data:photos
import "dotenv/config";
import { Prisma } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { fileNameFromCommonsUrl } from "@/lib/wikimedia";
import {
  COMMONS_BATCH,
  fetchImageInfo,
  forEachConcurrent,
  sparql,
} from "./lib/commons";
import { chunk } from "./lib/http";

const QUERY = `
SELECT ?insee (SAMPLE(?image) AS ?photo) (SAMPLE(?category) AS ?cat) WHERE {
  ?commune wdt:P31 wd:Q484170 ; wdt:P374 ?insee .
  FILTER NOT EXISTS { ?commune wdt:P576 ?dissolved }
  OPTIONAL { ?commune wdt:P18 ?image }
  OPTIONAL { ?commune wdt:P373 ?category }
}
GROUP BY ?insee`;

async function linkWikidata() {
  const bindings = await sparql<"insee" | "photo" | "cat">(QUERY);
  const known = new Set(
    (await prisma.commune.findMany({ select: { inseeCode: true } })).map(
      (c) => c.inseeCode,
    ),
  );
  const rows = bindings
    .map((b) => ({
      insee: b.insee?.value ?? "",
      photo: b.photo ? fileNameFromCommonsUrl(b.photo.value) : null,
      category: b.cat ? `Category:${b.cat.value}` : null,
    }))
    .filter((r) => known.has(r.insee));
  logger.info(
    { communes: rows.length, withPhoto: rows.filter((r) => r.photo).length },
    "fetched from Wikidata",
  );

  for (const batch of chunk(rows, 1_000)) {
    const values = batch.map(
      (r) => Prisma.sql`(${r.insee}, ${r.photo}, ${r.category})`,
    );
    // A photo that changed on Wikidata loses its old thumbnail and credits, to be refetched.
    await prisma.$executeRaw`
      UPDATE "Commune" AS c SET
        "photoFile" = v.photo,
        "commonsCategory" = v.cat,
        "photoThumbUrl" = CASE WHEN c."photoFile" IS DISTINCT FROM v.photo THEN NULL ELSE c."photoThumbUrl" END,
        "photoAuthor" = CASE WHEN c."photoFile" IS DISTINCT FROM v.photo THEN NULL ELSE c."photoAuthor" END,
        "photoLicense" = CASE WHEN c."photoFile" IS DISTINCT FROM v.photo THEN NULL ELSE c."photoLicense" END,
        "photoLicenseUrl" = CASE WHEN c."photoFile" IS DISTINCT FROM v.photo THEN NULL ELSE c."photoLicenseUrl" END
      FROM (VALUES ${Prisma.join(values)}) AS v(insee, photo, cat)
      WHERE c."inseeCode" = v.insee`;
  }
}

async function fetchCredits() {
  const pending = await prisma.commune.findMany({
    where: { photoFile: { not: null }, photoThumbUrl: null },
    select: { inseeCode: true, photoFile: true },
  });
  logger.info({ photos: pending.length }, "photos to resolve on Commons");

  let done = 0;
  let missing = 0;
  await forEachConcurrent(chunk(pending, COMMONS_BATCH), 3, async (batch) => {
    const infos = await fetchImageInfo(batch.map((c) => c.photoFile!));
    await prisma.$transaction(
      batch.map((c) => {
        const info = infos.get(c.photoFile!);
        if (!info) missing++;
        // A file deleted on Commons is dropped: the card falls back to the cartoon visual.
        return prisma.commune.update({
          where: { inseeCode: c.inseeCode },
          data: info
            ? {
                photoThumbUrl: info.thumbUrl,
                photoAuthor: info.author,
                photoLicense: info.license,
                photoLicenseUrl: info.licenseUrl,
              }
            : { photoFile: null },
        });
      }),
    );
    done += batch.length;
    if (done % 2_000 < COMMONS_BATCH)
      logger.info({ done, of: pending.length }, "progress");
  });
  logger.info({ resolved: done - missing, missing }, "photo credits fetched");
}

async function main() {
  await linkWikidata();
  await fetchCredits();
  const [withPhoto, total] = await Promise.all([
    prisma.commune.count({ where: { photoThumbUrl: { not: null } } }),
    prisma.commune.count(),
  ]);
  logger.info({ withPhoto, withoutPhoto: total - withPhoto }, "photo coverage");
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "photo import failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
