// Finds a public-domain old postcard for each commune, for the rare "carte postale ancienne"
// variant. Commons files postcards under "Postcards of <commune category>" (sometimes
// "Old postcards of …"). Run after data:photos, which fills the Commons categories.
// Resumable: communes already checked are skipped, unless --all is passed.
// Usage: npm run data:postcards [-- --all]
import "dotenv/config";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { isPublicDomain } from "@/lib/wikimedia";
import {
  COMMONS_BATCH,
  fetchCategoryFileCounts,
  fetchCategoryImages,
} from "./lib/commons";
import { chunk, sleep } from "./lib/http";

// How many files of a postcard category to inspect before giving up on finding a free one.
const FILES_TO_INSPECT = 20;
// Pause between Commons requests: the API rate-limits bursts (HTTP 429).
const PAUSE_MS = 250;

function postcardCategories(commonsCategory: string) {
  const name = commonsCategory.replace(/^Category:/, "");
  return [`Category:Postcards of ${name}`, `Category:Old postcards of ${name}`];
}

async function findPostcard(category: string) {
  const images = await fetchCategoryImages(category, FILES_TO_INSPECT);
  await sleep(PAUSE_MS);
  return images.find(
    (image) => image.info.license && isPublicDomain(image.info.license),
  );
}

async function main() {
  if (process.argv.includes("--all")) {
    await prisma.commune.updateMany({ data: { postcardCheckedAt: null } });
  }
  const communes = await prisma.commune.findMany({
    where: { commonsCategory: { not: null }, postcardCheckedAt: null },
    select: { inseeCode: true, commonsCategory: true },
    orderBy: { inseeCode: "asc" },
  });
  logger.info({ communes: communes.length }, "communes to check");

  let checked = 0;
  let found = 0;
  // Two category titles per commune, 50 titles per request.
  for (const batch of chunk(communes, COMMONS_BATCH / 2)) {
    const counts = await fetchCategoryFileCounts(
      batch.flatMap((c) => postcardCategories(c.commonsCategory!)),
    );
    await sleep(PAUSE_MS);

    for (const c of batch) {
      const category = postcardCategories(c.commonsCategory!).find(
        (title) => (counts.get(title) ?? 0) > 0,
      );
      const postcard = category ? await findPostcard(category) : undefined;
      if (postcard) found++;
      await prisma.commune.update({
        where: { inseeCode: c.inseeCode },
        data: {
          postcardFile: postcard?.file ?? null,
          postcardThumbUrl: postcard?.info.thumbUrl ?? null,
          postcardAuthor: postcard?.info.author ?? null,
          postcardLicense: postcard?.info.license ?? null,
          postcardCheckedAt: new Date(),
        },
      });
    }

    checked += batch.length;
    if (checked % 1_000 < batch.length)
      logger.info({ checked, of: communes.length, found }, "progress");
  }

  const eligible = await prisma.commune.count({
    where: { postcardFile: { not: null } },
  });
  logger.info({ eligible }, "communes eligible for the postcard variant");
}

main()
  .catch((error) => {
    logger.fatal({ err: error }, "postcard import failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
