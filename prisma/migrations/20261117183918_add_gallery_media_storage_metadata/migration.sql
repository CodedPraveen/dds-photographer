-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('SUPABASE', 'R2');

-- AlterTable
ALTER TABLE "GalleryMedia" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "storageProvider" "StorageProvider" NOT NULL DEFAULT 'SUPABASE',
ADD COLUMN     "width" INTEGER;
