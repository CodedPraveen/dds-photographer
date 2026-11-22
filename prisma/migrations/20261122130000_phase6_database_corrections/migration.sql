-- Phase 6 corrections. Additive and forward-only; do not run automatically.
-- Preflight: this index requires no GalleryMedia to have more than one active version.
CREATE UNIQUE INDEX "MediaVersion_one_active_per_media"
ON "MediaVersion" ("mediaId")
WHERE "isActive" = true;

ALTER TABLE "MediaTrash"
  DROP CONSTRAINT "MediaTrash_mediaId_fkey";

ALTER TABLE "MediaTrash"
  ADD CONSTRAINT "MediaTrash_mediaId_fkey"
  FOREIGN KEY ("mediaId") REFERENCES "GalleryMedia"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
