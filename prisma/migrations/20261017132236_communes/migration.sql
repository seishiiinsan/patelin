-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('COMMUNE', 'PEU_COMMUNE', 'RARE', 'EPIQUE', 'LEGENDAIRE', 'MYTHIQUE');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('DEPARTMENT', 'REGION', 'PREFECTURES', 'HOMONYMS');

-- CreateTable
CREATE TABLE "Region" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chefLieu" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Department" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "chefLieu" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Commune" (
    "inseeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "surfaceHa" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL,
    "tier" "Tier" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "photoFile" TEXT,
    "photoThumbUrl" TEXT,
    "photoAuthor" TEXT,
    "photoLicense" TEXT,
    "photoLicenseUrl" TEXT,
    "postcardFile" TEXT,
    "postcardThumbUrl" TEXT,
    "postcardAuthor" TEXT,
    "postcardLicense" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("inseeCode")
);

-- CreateTable
CREATE TABLE "CardSet" (
    "slug" TEXT NOT NULL,
    "type" "SetType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CardSet_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "SetMember" (
    "setSlug" TEXT NOT NULL,
    "inseeCode" TEXT NOT NULL,

    CONSTRAINT "SetMember_pkey" PRIMARY KEY ("setSlug","inseeCode")
);

-- CreateIndex
CREATE INDEX "Department_regionCode_idx" ON "Department"("regionCode");

-- CreateIndex
CREATE INDEX "Commune_departmentCode_idx" ON "Commune"("departmentCode");

-- CreateIndex
CREATE INDEX "Commune_regionCode_idx" ON "Commune"("regionCode");

-- CreateIndex
CREATE INDEX "Commune_tier_idx" ON "Commune"("tier");

-- CreateIndex
CREATE INDEX "Commune_name_idx" ON "Commune"("name");

-- CreateIndex
CREATE INDEX "CardSet_type_idx" ON "CardSet"("type");

-- CreateIndex
CREATE INDEX "SetMember_inseeCode_idx" ON "SetMember"("inseeCode");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetMember" ADD CONSTRAINT "SetMember_setSlug_fkey" FOREIGN KEY ("setSlug") REFERENCES "CardSet"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetMember" ADD CONSTRAINT "SetMember_inseeCode_fkey" FOREIGN KEY ("inseeCode") REFERENCES "Commune"("inseeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

