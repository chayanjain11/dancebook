-- Rename venue column to studioName and add studioAddress
ALTER TABLE "Workshop" RENAME COLUMN "venue" TO "studioName";
ALTER TABLE "Workshop" ADD COLUMN "studioAddress" TEXT NOT NULL DEFAULT '';
