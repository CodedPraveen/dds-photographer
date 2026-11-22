-- Phase 6 additive foundation. Forward-only; do not run automatically.
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MASTER_ADMIN');
CREATE TYPE "AdminInvitationRole" AS ENUM ('ADMIN', 'MASTER_ADMIN');
CREATE TYPE "AdminInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "UploadSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "UploadMode" AS ENUM ('SINGLE', 'MULTIPART');
CREATE TYPE "UploadVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
CREATE TYPE "UploadFileStatus" AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'VERIFIED', 'FAILED', 'CANCELLED');
CREATE TYPE "ProcessingSummary" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE "PublicationStatus" AS ENUM ('UNPUBLISHED', 'PUBLISHED');
CREATE TYPE "DerivativeType" AS ENUM ('ORIGINAL', 'DOWNLOAD', 'GALLERY', 'THUMBNAIL');
CREATE TYPE "DerivativeProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED', 'RETRYING');
CREATE TYPE "ProcessingJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "TrashStatus" AS ENUM ('ACTIVE', 'RESTORED', 'DELETING', 'CLEANUP_FAILED', 'PERMANENTLY_DELETED');

ALTER TABLE "AdminUser" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "AdminUser" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
-- Safe one-time promotion: updates every existing account, preserving credentials and sessions.
UPDATE "AdminUser" SET "role" = 'MASTER_ADMIN' WHERE "id" = (SELECT "id" FROM "AdminUser" ORDER BY "createdAt", "id" LIMIT 1);

CREATE TABLE "AdminInvitation" (
  "id" TEXT NOT NULL, "inviterAdminId" TEXT NOT NULL, "acceptedAdminId" TEXT,
  "inviteeEmail" TEXT NOT NULL, "role" "AdminInvitationRole" NOT NULL, "tokenHash" TEXT NOT NULL,
  "status" "AdminInvitationStatus" NOT NULL DEFAULT 'PENDING', "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminInvitation_tokenHash_key" ON "AdminInvitation"("tokenHash");
CREATE INDEX "AdminInvitation_inviteeEmail_status_idx" ON "AdminInvitation"("inviteeEmail", "status");
CREATE INDEX "AdminInvitation_expiresAt_status_idx" ON "AdminInvitation"("expiresAt", "status");
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_inviterAdminId_fkey" FOREIGN KEY ("inviterAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_acceptedAdminId_fkey" FOREIGN KEY ("acceptedAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "UploadSession" ("id" TEXT NOT NULL, "adminId" TEXT NOT NULL, "galleryId" TEXT NOT NULL, "status" "UploadSessionStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMP(3) NOT NULL, "cancelledAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "progressMetadata" JSONB, CONSTRAINT "UploadSession_pkey" PRIMARY KEY ("id"));
CREATE TABLE "UploadFile" ("id" TEXT NOT NULL, "uploadSessionId" TEXT NOT NULL, "originalFilename" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "sha256" TEXT NOT NULL, "uploadMode" "UploadMode" NOT NULL, "r2ObjectKey" TEXT NOT NULL, "multipartUploadId" TEXT, "verificationStatus" "UploadVerificationStatus" NOT NULL DEFAULT 'PENDING', "status" "UploadFileStatus" NOT NULL DEFAULT 'PENDING', "failureDetails" TEXT, "partMetadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "completedAt" TIMESTAMP(3), CONSTRAINT "UploadFile_pkey" PRIMARY KEY ("id"));
ALTER TABLE "UploadSession" ADD CONSTRAINT "UploadSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UploadSession" ADD CONSTRAINT "UploadSession_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadFile" ADD CONSTRAINT "UploadFile_uploadSessionId_fkey" FOREIGN KEY ("uploadSessionId") REFERENCES "UploadSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "UploadSession_adminId_status_idx" ON "UploadSession"("adminId", "status"); CREATE INDEX "UploadSession_galleryId_status_idx" ON "UploadSession"("galleryId", "status"); CREATE INDEX "UploadSession_expiresAt_status_idx" ON "UploadSession"("expiresAt", "status"); CREATE INDEX "UploadFile_uploadSessionId_status_idx" ON "UploadFile"("uploadSessionId", "status"); CREATE INDEX "UploadFile_sha256_idx" ON "UploadFile"("sha256");

CREATE TABLE "MediaVersion" ("id" TEXT NOT NULL, "mediaId" TEXT NOT NULL, "predecessorVersionId" TEXT, "originalObjectKey" TEXT NOT NULL, "versionNumber" INTEGER NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT false, "processingSummary" "ProcessingSummary" NOT NULL DEFAULT 'QUEUED', "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'UNPUBLISHED', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "replacedAt" TIMESTAMP(3), "retentionUntil" TIMESTAMP(3), CONSTRAINT "MediaVersion_pkey" PRIMARY KEY ("id"));
CREATE TABLE "MediaDerivative" ("id" TEXT NOT NULL, "mediaVersionId" TEXT NOT NULL, "derivativeType" "DerivativeType" NOT NULL, "objectKey" TEXT NOT NULL, "format" TEXT NOT NULL, "width" INTEGER, "height" INTEGER, "sizeBytes" INTEGER, "sha256" TEXT, "processingStatus" "DerivativeProcessingStatus" NOT NULL DEFAULT 'QUEUED', "failureDetails" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "MediaDerivative_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProcessingJob" ("id" TEXT NOT NULL, "bullmqJobId" TEXT NOT NULL, "mediaVersionId" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "status" "ProcessingJobStatus" NOT NULL DEFAULT 'QUEUED', "attemptCount" INTEGER NOT NULL DEFAULT 0, "manualRetry" BOOLEAN NOT NULL DEFAULT false, "errorDetails" TEXT, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProcessingJob_pkey" PRIMARY KEY ("id"));
CREATE TABLE "MediaTrash" ("id" TEXT NOT NULL, "mediaId" TEXT NOT NULL, "status" "TrashStatus" NOT NULL DEFAULT 'ACTIVE', "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "retentionUntil" TIMESTAMP(3) NOT NULL, "restoredAt" TIMESTAMP(3), "permanentlyDeletedAt" TIMESTAMP(3), "cleanupAttempts" INTEGER NOT NULL DEFAULT 0, "cleanupLastError" TEXT, "cleanupLastAttemptAt" TIMESTAMP(3), CONSTRAINT "MediaTrash_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "MediaVersion_mediaId_versionNumber_key" ON "MediaVersion"("mediaId", "versionNumber"); CREATE INDEX "MediaVersion_mediaId_isActive_idx" ON "MediaVersion"("mediaId", "isActive"); CREATE INDEX "MediaVersion_retentionUntil_idx" ON "MediaVersion"("retentionUntil"); CREATE UNIQUE INDEX "MediaDerivative_mediaVersionId_derivativeType_key" ON "MediaDerivative"("mediaVersionId", "derivativeType"); CREATE INDEX "MediaDerivative_processingStatus_idx" ON "MediaDerivative"("processingStatus"); CREATE UNIQUE INDEX "ProcessingJob_bullmqJobId_key" ON "ProcessingJob"("bullmqJobId"); CREATE UNIQUE INDEX "ProcessingJob_idempotencyKey_key" ON "ProcessingJob"("idempotencyKey"); CREATE INDEX "ProcessingJob_mediaVersionId_status_idx" ON "ProcessingJob"("mediaVersionId", "status"); CREATE UNIQUE INDEX "MediaTrash_mediaId_key" ON "MediaTrash"("mediaId"); CREATE INDEX "MediaTrash_status_retentionUntil_idx" ON "MediaTrash"("status", "retentionUntil");
ALTER TABLE "MediaVersion" ADD CONSTRAINT "MediaVersion_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "GalleryMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "MediaVersion" ADD CONSTRAINT "MediaVersion_predecessorVersionId_fkey" FOREIGN KEY ("predecessorVersionId") REFERENCES "MediaVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE; ALTER TABLE "MediaDerivative" ADD CONSTRAINT "MediaDerivative_mediaVersionId_fkey" FOREIGN KEY ("mediaVersionId") REFERENCES "MediaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "ProcessingJob" ADD CONSTRAINT "ProcessingJob_mediaVersionId_fkey" FOREIGN KEY ("mediaVersionId") REFERENCES "MediaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "MediaTrash" ADD CONSTRAINT "MediaTrash_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "GalleryMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
