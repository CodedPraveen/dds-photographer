import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import sharp from "sharp";

import { completeUpload } from "../src/features/admin/server/complete-upload.js";

const jpeg = await sharp({
  create: { width: 2, height: 2, channels: 3, background: "white" },
})
  .jpeg()
  .toBuffer();
const sha256 = createHash("sha256").update(jpeg).digest("hex");
const baseSession = {
  id: "session-1",
  adminId: "admin-1",
  galleryId: "gallery-1",
  status: "ACTIVE",
  expiresAt: new Date(Date.now() + 60_000),
};
const baseFile = {
  id: "file-1",
  uploadSessionId: "session-1",
  originalFilename: "photo.jpg",
  sizeBytes: jpeg.length,
  sha256,
  uploadMode: "SINGLE",
  r2ObjectKey: "galleries/gallery-1/file-1/versions/session-1/original.jpg",
  status: "UPLOADED",
  verificationStatus: "PENDING",
};

function fixture({
  session = baseSession,
  file = baseFile,
  object = jpeg,
  headSize = object.length,
  existingMedia = null,
} = {}) {
  let storedFile = { ...file };
  let media = existingMedia;
  let lockTail = Promise.resolve();
  const lock = async () => {
    const previous = lockTail;
    let release;
    lockTail = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    release();
  };
  const tx = {
    $executeRaw: async () => {},
    uploadFile: {
      findUnique: async () => ({
        status: storedFile.status,
        verificationStatus: storedFile.verificationStatus,
      }),
      update: async ({ data }) => {
        storedFile = { ...storedFile, ...data };
        return storedFile;
      },
    },
    galleryMedia: {
      findFirst: async () => media,
      count: async () => (media ? 1 : 0),
      create: async () => {
        media = {
          id: "media-1",
          storageKey: storedFile.r2ObjectKey,
          sizeBytes: jpeg.length,
          width: 2,
          height: 2,
        };
        return media;
      },
    },
  };
  return {
    getCurrentAdmin: async () => ({ id: "admin-1", isActive: true }),
    prisma: {
      uploadSession: { findUnique: async () => session },
      uploadFile: { findUnique: async () => storedFile },
      galleryMedia: { findFirst: async () => media },
      $transaction: async (callback) => {
        await lock();
        return callback(tx);
      },
    },
    objectExists: async () => true,
    getMetadata: async () => ({ sizeBytes: headSize }),
    downloadFile: async () => new Response(object).body,
    audit: async () => {},
    lock: async () => {},
    get state() {
      return { file: storedFile, media };
    },
  };
}

test("completion enforces Admin authorization, gallery/session ownership, and expiry", async () => {
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: { ...fixture(), getCurrentAdmin: async () => null },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({
          session: { ...baseSession, adminId: "other-admin" },
        }),
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({
          session: { ...baseSession, expiresAt: new Date(Date.now() - 1) },
        }),
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({
          file: { ...baseFile, uploadSessionId: "other-session" },
        }),
      })
    ).status,
    404,
  );
});

test("completion rejects missing objects, wrong size, bad checksums, and invalid JPEGs", async () => {
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: { ...fixture(), objectExists: async () => false },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({ headSize: jpeg.length + 1 }),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({
          file: { ...baseFile, sha256: "0".repeat(64) },
        }),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await completeUpload({
        sessionId: "session-1",
        fileId: "file-1",
        dependencies: fixture({
          object: Buffer.from("invalid jpeg"),
          headSize: 12,
        }),
      })
    ).status,
    400,
  );
});

test("successful completion is transactional and concurrent duplicates share one media", async () => {
  const dependencies = fixture();
  const results = await Promise.all([
    completeUpload({ sessionId: "session-1", fileId: "file-1", dependencies }),
    completeUpload({ sessionId: "session-1", fileId: "file-1", dependencies }),
  ]);
  assert.equal(results[0].success, true);
  assert.equal(results[1].success, true);
  assert.equal(results[0].media.id, "media-1");
  assert.equal(results[1].media.id, "media-1");
  assert.equal(dependencies.state.file.status, "VERIFIED");
});
