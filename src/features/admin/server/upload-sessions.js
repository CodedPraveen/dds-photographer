import "server-only";

import { randomUUID } from "node:crypto";

import { createUploadUrl } from "@/lib/storage";
import { buildVersionedObjectKey } from "@/lib/storage/providers/cloudflare-r2";

import { audit, getCurrentAdmin } from "./auth";
import { prisma } from "./prisma";
import { MAX_ORIGINAL_SIZE, SESSION_TTL_MS, UPLOAD_URL_TTL_SECONDS, validateUploadFileInput } from "./upload-policy";

export { MAX_ORIGINAL_SIZE, SESSION_TTL_MS, UPLOAD_URL_TTL_SECONDS, validateUploadFileInput } from "./upload-policy";

export async function createUploadSession({ galleryId, files }) {
    const admin = await getCurrentAdmin();
    if (!admin || admin.isActive === false) return { error: "Unauthorized.", status: 401 };
    if (typeof galleryId !== "string" || !Array.isArray(files) || files.length === 0) {
        return { error: "A gallery and at least one file are required.", status: 400 };
    }

    const gallery = await prisma.gallery.findUnique({ where: { id: galleryId }, select: { id: true, isActive: true } });
    if (!gallery || !gallery.isActive) return { error: "Gallery not found.", status: 404 };

    for (const file of files) {
        const validationError = validateUploadFileInput(file);
        if (validationError) return { error: validationError, status: 400 };
    }

    const now = new Date();
    const session = await prisma.uploadSession.create({
        data: {
            adminId: admin.id,
            galleryId,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
            progressMetadata: { fileCount: files.length },
        },
    });

    try {
        const signedFiles = [];
        for (const file of files) {
            const fileId = randomUUID();
            const key = buildVersionedObjectKey({ galleryId, photoId: fileId, versionId: session.id });
            const uploadFile = await prisma.uploadFile.create({
                data: {
                    id: fileId,
                    uploadSessionId: session.id,
                    originalFilename: file.filename,
                    sizeBytes: file.sizeBytes,
                    sha256: typeof file.sha256 === "string" ? file.sha256 : "",
                    uploadMode: "SINGLE",
                    r2ObjectKey: key,
                },
            });
            signedFiles.push({ id: uploadFile.id, filename: file.filename, sizeBytes: file.sizeBytes, objectKey: key, uploadUrl: await createUploadUrl({ key, contentType: "image/jpeg", expiresIn: UPLOAD_URL_TTL_SECONDS }) });
        }
        await audit(admin.id, "upload.session.create", session.id, { galleryId, fileCount: files.length });
        return { sessionId: session.id, expiresAt: session.expiresAt, uploadUrlExpiresIn: UPLOAD_URL_TTL_SECONDS, files: signedFiles };
    } catch (error) {
        await prisma.uploadSession.update({ where: { id: session.id }, data: { status: "CANCELLED", cancelledAt: new Date() } }).catch(() => {});
        throw error;
    }
}
