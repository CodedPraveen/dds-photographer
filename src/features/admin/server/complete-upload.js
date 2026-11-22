import "server-only";

import { downloadFile, getMetadata, objectExists } from "../../../lib/storage/index.js";
import { audit, getCurrentAdmin } from "./auth.js";
import { prisma } from "./prisma.js";
import { verifyUploadedObject } from "./upload-verification.js";

const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;

async function readWebStream(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
}

export async function completeUpload({ sessionId, fileId, dependencies = {} }) {
    const getAdmin = dependencies.getCurrentAdmin || getCurrentAdmin;
    const db = dependencies.prisma || prisma;
    const exists = dependencies.objectExists || ((key) => objectExists(key, "R2"));
    const metadata = dependencies.getMetadata || ((key) => getMetadata(key, "R2"));
    const download = dependencies.downloadFile || ((key) => downloadFile(key, "R2"));
    const writeAudit = dependencies.audit || audit;

    const admin = await getAdmin();
    if (!admin || admin.isActive === false) return { error: "Unauthorized.", status: 401 };

    const session = await db.uploadSession.findUnique({ where: { id: sessionId }, select: { id: true, adminId: true, galleryId: true, status: true, expiresAt: true } });
    if (!session || session.adminId !== admin.id) return { error: "Unauthorized.", status: 401 };
    if (session.status !== "ACTIVE" || session.expiresAt <= new Date()) return { error: "Upload session is expired or inactive.", status: 409 };

    const file = await db.uploadFile.findUnique({ where: { id: fileId }, select: { id: true, uploadSessionId: true, originalFilename: true, sizeBytes: true, sha256: true, uploadMode: true, r2ObjectKey: true, status: true, verificationStatus: true } });
    if (!file || file.uploadSessionId !== session.id || file.uploadMode !== "SINGLE") return { error: "Upload file not found.", status: 404 };

    if (file.status === "VERIFIED" && file.verificationStatus === "VERIFIED") {
        const existing = await db.galleryMedia.findFirst({ where: { galleryId: session.galleryId, storageKey: file.r2ObjectKey }, select: { id: true, storageKey: true, sizeBytes: true, width: true, height: true } });
        if (existing) return { success: true, idempotent: true, media: existing };
    }

    if (!await exists(file.r2ObjectKey)) return { error: "Uploaded object was not found.", status: 400 };
    const head = await metadata(file.r2ObjectKey);
    if (!head || !Number.isInteger(head.sizeBytes) || head.sizeBytes !== file.sizeBytes || head.sizeBytes > MAX_ORIGINAL_SIZE) return { error: "Uploaded object size is invalid.", status: 400 };

    let bytes;
    try { bytes = await readWebStream(await download(file.r2ObjectKey)); } catch { return { error: "Uploaded object could not be read.", status: 400 }; }
    let verified;
    try { verified = await verifyUploadedObject({ bytes, expectedSize: file.sizeBytes, expectedSha256: file.sha256 }); } catch (error) {
        return { error: error.message, status: 400 };
    }

    const result = await db.$transaction(async (tx) => {
        const claimed = await tx.uploadFile.updateMany({ where: { id: file.id, status: { not: "VERIFIED" }, verificationStatus: { not: "VERIFIED" } }, data: { status: "VERIFIED", verificationStatus: "VERIFIED", completedAt: new Date() } });
        if (claimed.count === 0) {
            return tx.galleryMedia.findFirst({ where: { galleryId: session.galleryId, storageKey: file.r2ObjectKey }, select: { id: true, storageKey: true, sizeBytes: true, width: true, height: true } });
        }
        const mediaCount = await tx.galleryMedia.count({ where: { galleryId: session.galleryId } });
        const media = await tx.galleryMedia.create({ data: { galleryId: session.galleryId, storageProvider: "R2", storageKey: file.r2ObjectKey, altText: file.originalFilename, mimeType: "image/jpeg", sizeBytes: verified.sizeBytes, width: verified.width, height: verified.height, sortOrder: mediaCount, isCover: mediaCount === 0 }, select: { id: true, storageKey: true, sizeBytes: true, width: true, height: true } });
        return media;
    });
    await writeAudit(admin.id, "upload.file.verify", file.id, { sessionId, galleryId: session.galleryId, sizeBytes: verified.sizeBytes, sha256: verified.sha256 });
    return { success: true, idempotent: false, media: result };
}
