import "server-only";

import { getMultipartStorage } from "../../../lib/storage/index.js";
import { completeUpload } from "./complete-upload.js";
import { MULTIPART_PART_SIZE, SESSION_TTL_MS, UPLOAD_URL_TTL_SECONDS } from "./upload-policy.js";

const failure = (status, error) => ({ status, error });
const transactionOptions = { timeout: 60_000, isolationLevel: "ReadCommitted" };

export function multipartPartSize(total, number) {
    if (!Number.isInteger(number) || number < 1) return 0;
    return Math.max(0, Math.min(MULTIPART_PART_SIZE, total - (number - 1) * MULTIPART_PART_SIZE));
}

export function verifiedParts(parts, total) {
    const ordered = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
    if (ordered.length !== Math.ceil(total / MULTIPART_PART_SIZE)) return null;
    if (ordered.some((part, index) => part.PartNumber !== index + 1 ||
        part.Size !== multipartPartSize(total, index + 1) || !part.ETag)) return null;
    return ordered.map(({ PartNumber, ETag }) => ({ PartNumber, ETag }));
}

async function lockFile(tx, id) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
}

export async function operateMultipart({ sessionId, fileId, action, partNumber }, deps) {
    const admin = await deps.getCurrentAdmin();
    if (!admin || admin.isActive === false) return failure(401, "Unauthorized.");
    const { db } = deps;
    let created;
    let storage;
    let result;
    try {
        result = await db.$transaction(async (tx) => {
            await lockFile(tx, fileId);
            const file = await tx.uploadFile.findUnique({ where: { id: fileId }, include: { uploadSession: true } });
            const session = file?.uploadSession;
            if (!session || session.id !== sessionId || session.adminId !== admin.id || file.uploadMode !== "MULTIPART") {
                return failure(404, "Upload file not found.");
            }
            if (session.status !== "ACTIVE" || session.expiresAt <= new Date()) {
                return failure(409, "Upload session is inactive or expired.");
            }
            const { r2ObjectKey: key, multipartUploadId: uploadId, status } = file;
            const update = (data) => tx.uploadFile.update({ where: { id: fileId }, data });
            if (action === "abort" && status === "CANCELLED") return { success: true };
            if (action === "complete" && ["UPLOADED", "VERIFIED"].includes(status)) return { verify: true };
            if (!["PENDING", "UPLOADING"].includes(status)) return failure(409, "Upload is no longer open.");
            if (!["start", "part", "complete", "abort"].includes(action)) return failure(400, "Invalid multipart action.");
            storage = await deps.getStorage();
            let response = { success: true };
            if (action === "start") {
                if (!uploadId) {
                    if (await storage.objectExists(key)) return failure(409, "An original already exists at this key.");
                    const id = await storage.startMultipart(key);
                    created = { key, id };
                    await update({ multipartUploadId: id, status: "UPLOADING" });
                }
                response.partCount = Math.ceil(file.sizeBytes / MULTIPART_PART_SIZE);
                response.partSize = MULTIPART_PART_SIZE;
            } else if (action === "abort") {
                if (uploadId) {
                    if (await storage.objectExists(key)) return failure(409, "Upload has already finalized.");
                    await storage.abortMultipart(key, uploadId);
                }
                await update({ status: "CANCELLED", multipartUploadId: null, partMetadata: { state: "aborted" } });
            } else {
                if (!uploadId) return failure(409, "Start the multipart upload first.");
                if (action === "part") {
                    const size = multipartPartSize(file.sizeBytes, partNumber);
                    if (!size) return failure(400, "Invalid part number.");
                    const expiresIn = Math.min(UPLOAD_URL_TTL_SECONDS, Math.floor((session.expiresAt - Date.now()) / 1000));
                    if (expiresIn < 1) return failure(409, "Upload session is expiring.");
                    response = { uploadUrl: await storage.signPart({ key, uploadId, partNumber, size, expiresIn }), size, expiresIn };
                } else {
                    // A finalized object can survive a lost R2 response or DB rollback.
                    if (!await storage.objectExists(key)) {
                        const parts = verifiedParts(await storage.listParts(key, uploadId), file.sizeBytes);
                        if (!parts) return failure(409, "Upload parts are missing or have incorrect sizes.");
                        await storage.finishMultipart(key, uploadId, parts);
                    }
                    await update({ status: "UPLOADED", partMetadata: { state: "finalized" } });
                    response = { verify: true };
                }
            }
            if (action !== "abort") {
                const now = new Date();
                await tx.uploadSession.updateMany({
                    where: { id: sessionId, status: "ACTIVE", expiresAt: { gt: now } },
                    data: { lastActivityAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
                });
            }
            return response;
        }, transactionOptions);
    } catch (error) {
        if (created) {
            // Re-read persisted state before compensating for a failed or ambiguous commit.
            const saved = await db.uploadFile.findUnique({ where: { id: fileId } });
            if (saved?.multipartUploadId !== created.id) await storage.abortMultipart(created.key, created.id);
        }
        throw error;
    }
    if (result.verify) return deps.verify({ sessionId, fileId, multipart: true });
    return result;
}

export async function multipartRequest(input) {
    const { getCurrentAdmin } = await import("./auth.js");
    const { prisma } = await import("./prisma.js");
    return operateMultipart(input, { getCurrentAdmin, db: prisma, getStorage: getMultipartStorage, verify: completeUpload });
}

export async function cleanupExpiredMultipart(db, storage, now = new Date()) {
    const where = {
        uploadMode: "MULTIPART", multipartUploadId: { not: null },
        status: { in: ["PENDING", "UPLOADING"] },
        uploadSession: { status: { in: ["ACTIVE", "EXPIRED"] }, expiresAt: { lte: now } },
    };
    const candidates = await db.uploadFile.findMany({ where, select: { id: true } });
    let aborted = 0;
    let failed = 0;
    for (const { id } of candidates) {
        try {
            const removed = await db.$transaction(async (tx) => {
                await lockFile(tx, id);
                const file = await tx.uploadFile.findFirst({ where: { ...where, id } });
                if (!file || await storage.objectExists(file.r2ObjectKey)) return false;
                await storage.abortMultipart(file.r2ObjectKey, file.multipartUploadId);
                await tx.uploadFile.update({
                    where: { id }, data: { status: "CANCELLED", multipartUploadId: null, partMetadata: { state: "expired" } },
                });
                return true;
            }, transactionOptions);
            if (removed) aborted++;
        } catch {
            failed++;
        }
    }
    return { aborted, failed };
}
