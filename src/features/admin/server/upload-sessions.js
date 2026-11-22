import "server-only";

import { randomUUID } from "node:crypto";

import { createUploadUrl } from "../../../lib/storage/index.js";
import { buildVersionedObjectKey } from "../../../lib/storage/providers/cloudflare-r2.js";
import {
  SESSION_TTL_MS,
  SINGLE_UPLOAD_LIMIT,
  UPLOAD_URL_TTL_SECONDS,
  validateUploadFileInput,
} from "./upload-policy.js";

export {
  MAX_ORIGINAL_SIZE,
  SESSION_TTL_MS,
  UPLOAD_URL_TTL_SECONDS,
  validateUploadFileInput,
} from "./upload-policy.js";

export async function createUploadSession({
  galleryId,
  files,
  dependencies = {},
}) {
  const auth =
    dependencies.getCurrentAdmin && dependencies.audit
      ? null
      : await import("./auth.js");
  const database = dependencies.prisma ? null : await import("./prisma.js");
  const getAdmin = dependencies.getCurrentAdmin || auth.getCurrentAdmin;
  const db = dependencies.prisma || database.prisma;
  const signUpload = dependencies.createUploadUrl || createUploadUrl;
  const writeAudit = dependencies.audit || auth.audit;
  const admin = await getAdmin();
  if (!admin || admin.isActive === false)
    return { error: "Unauthorized.", status: 401 };
  if (
    typeof galleryId !== "string" ||
    !Array.isArray(files) ||
    files.length === 0
  ) {
    return {
      error: "A gallery and at least one file are required.",
      status: 400,
    };
  }

  const gallery = await db.gallery.findUnique({
    where: { id: galleryId },
    select: { id: true, isActive: true },
  });
  if (!gallery || !gallery.isActive)
    return { error: "Gallery not found.", status: 404 };

  for (const file of files) {
    const validationError = validateUploadFileInput(file);
    if (validationError) return { error: validationError, status: 400 };
  }

  const result = await db.$transaction(async (tx) => {
    const now = new Date();
    const session = await tx.uploadSession.create({
      data: {
        adminId: admin.id,
        galleryId,
        expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        progressMetadata: { fileCount: files.length },
      },
    });
    const signedFiles = [];
    for (const file of files) {
      const fileId = randomUUID();
      const key = buildVersionedObjectKey({
        galleryId,
        photoId: fileId,
        versionId: session.id,
      });
      const uploadMode =
        file.sizeBytes > SINGLE_UPLOAD_LIMIT ? "MULTIPART" : "SINGLE";
      const uploadFile = await tx.uploadFile.create({
        data: {
          id: fileId,
          uploadSessionId: session.id,
          originalFilename: file.filename,
          sizeBytes: file.sizeBytes,
          sha256: file.sha256.toLowerCase(),
          uploadMode,
          r2ObjectKey: key,
        },
      });
      signedFiles.push({
        id: uploadFile.id,
        filename: file.filename,
        sizeBytes: file.sizeBytes,
        uploadMode,
        ...(uploadMode === "SINGLE" && {
          objectKey: key,
          uploadUrl: await signUpload({
            key,
            contentType: "image/jpeg",
            expiresIn: UPLOAD_URL_TTL_SECONDS,
          }),
        }),
      });
    }
    return {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      uploadUrlExpiresIn: UPLOAD_URL_TTL_SECONDS,
      files: signedFiles,
    };
  });
  await writeAudit(admin.id, "upload.session.create", result.sessionId, {
    galleryId,
    fileCount: files.length,
  });
  return result;
}
