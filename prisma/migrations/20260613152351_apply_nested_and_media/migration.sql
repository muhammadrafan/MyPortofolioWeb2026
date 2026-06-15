/*
  Warnings:

  - You are about to drop the column `content` on the `SectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `SectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `SectionItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'DOCUMENT');

-- AlterTable
ALTER TABLE "SectionItem" DROP COLUMN "content",
DROP COLUMN "subtitle",
DROP COLUMN "timeline";

-- CreateTable
CREATE TABLE "SectionSubItem" (
    "id" SERIAL NOT NULL,
    "sectionItemId" INTEGER NOT NULL,
    "subtitle" TEXT,
    "timeline" TEXT,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SectionSubItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "sectionSubItemId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "title" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SectionSubItem" ADD CONSTRAINT "SectionSubItem_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "SectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_sectionSubItemId_fkey" FOREIGN KEY ("sectionSubItemId") REFERENCES "SectionSubItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
