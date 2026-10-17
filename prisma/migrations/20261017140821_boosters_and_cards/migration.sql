-- Phase 3: boosters and cards.
-- CreateEnum
CREATE TYPE "BoosterKind" AS ENUM ('FREE', 'DAILY', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "CardVariant" AS ENUM ('POSTCARD');

-- AlterTable: searchName is filled from the name, the same way as searchKey() in lib/search.ts.
-- The unaccent extension is only needed for this backfill; the import script computes it in JS.
ALTER TABLE "Commune" ADD COLUMN "searchName" TEXT;
CREATE EXTENSION IF NOT EXISTS unaccent;
UPDATE "Commune"
SET "searchName" = trim(regexp_replace(lower(unaccent("name")), '[^a-z0-9]+', ' ', 'g'));
DROP EXTENSION unaccent;
ALTER TABLE "Commune" ALTER COLUMN "searchName" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "freeBoostersFrom" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Booster" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "BoosterKind" NOT NULL,
    "departmentCode" TEXT,
    "day" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "communeCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "newPositions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Booster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardStack" (
    "userId" TEXT NOT NULL,
    "inseeCode" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "firstObtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardStack_pkey" PRIMARY KEY ("userId","inseeCode"),
    CONSTRAINT "CardStack_count_check" CHECK ("count" >= 0)
);

-- CreateTable
CREATE TABLE "CardInstance" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "inseeCode" TEXT NOT NULL,
    "variant" "CardVariant",
    "tier" "Tier" NOT NULL,
    "boosterId" TEXT,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booster_userId_openedAt_idx" ON "Booster"("userId", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Booster_userId_kind_day_key" ON "Booster"("userId", "kind", "day");

-- CreateIndex
CREATE INDEX "CardStack_inseeCode_idx" ON "CardStack"("inseeCode");

-- CreateIndex
CREATE INDEX "CardInstance_ownerId_inseeCode_idx" ON "CardInstance"("ownerId", "inseeCode");

-- CreateIndex
CREATE INDEX "CardInstance_inseeCode_idx" ON "CardInstance"("inseeCode");

-- AddForeignKey
ALTER TABLE "Booster" ADD CONSTRAINT "Booster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardStack" ADD CONSTRAINT "CardStack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardStack" ADD CONSTRAINT "CardStack_inseeCode_fkey" FOREIGN KEY ("inseeCode") REFERENCES "Commune"("inseeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardInstance" ADD CONSTRAINT "CardInstance_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardInstance" ADD CONSTRAINT "CardInstance_inseeCode_fkey" FOREIGN KEY ("inseeCode") REFERENCES "Commune"("inseeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardInstance" ADD CONSTRAINT "CardInstance_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "Booster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
