import assert from "node:assert/strict";
import test from "node:test";

import { MAX_ORIGINAL_SIZE, SESSION_TTL_MS, UPLOAD_URL_TTL_SECONDS, validateUploadFileInput } from "../src/features/admin/server/upload-policy.js";
import { createUploadSession } from "../src/features/admin/server/upload-sessions.js";

const valid = { filename: "photo.jpg", mimeType: "image/jpeg", sizeBytes: 1024 };

test("upload session policy accepts JPEGs through 50 MB and rejects other types", () => {
  assert.equal(validateUploadFileInput({ ...valid, sizeBytes: MAX_ORIGINAL_SIZE }), null);
  assert.match(validateUploadFileInput({ ...valid, mimeType: "image/png" }), /Only JPEG/);
  assert.match(validateUploadFileInput({ ...valid, mimeType: "image/jpg" }), /Only JPEG/);
  assert.match(validateUploadFileInput({ ...valid, sizeBytes: MAX_ORIGINAL_SIZE + 1 }), /50 MB/);
});

test("upload session policy does not silently enable multipart uploads", () => {
  assert.match(validateUploadFileInput({ ...valid, uploadMode: "MULTIPART" }), /Multipart/);
});

test("upload authorizations and sessions use the approved lifetimes", () => {
  assert.equal(UPLOAD_URL_TTL_SECONDS, 15 * 60);
  assert.equal(SESSION_TTL_MS, 7 * 24 * 60 * 60 * 1000);
});

function sessionDependencies({ sign = async ({ key, expiresIn }) => `https://upload.test/${key}?expires=${expiresIn}`, gallery = { id: "gallery-1", isActive: true } } = {}) {
  const state = { sessions: [], files: [], committed: false, rolledBack: false, signCalls: [] };
  const tx = {
    uploadSession: { create: async ({ data }) => { const value = { id: "session-1", ...data }; state.sessions.push(value); return value; } },
    uploadFile: { create: async ({ data }) => { const value = { id: `file-${state.files.length + 1}`, ...data }; state.files.push(value); return value; } },
  };
  return {
    getCurrentAdmin: async () => ({ id: "admin-1", isActive: true }),
    audit: async () => {},
    createUploadUrl: async (input) => { state.signCalls.push(input); return sign(input); },
    prisma: {
      gallery: { findUnique: async () => gallery },
      $transaction: async (callback) => {
        try { const result = await callback(tx); state.committed = true; return result; }
        catch (error) { state.sessions.length = 0; state.files.length = 0; state.rolledBack = true; throw error; }
      },
    },
    state,
  };
}

test("session creation authorizes the Admin and gallery, and signs URLs server-side", async () => {
  const dependencies = sessionDependencies();
  const result = await createUploadSession({ galleryId: "gallery-1", files: [valid], dependencies });
  assert.equal(result.files.length, 1);
  assert.equal(dependencies.state.committed, true);
  assert.equal(dependencies.state.signCalls[0].expiresIn, UPLOAD_URL_TTL_SECONDS);
  const unauthorized = await createUploadSession({ galleryId: "gallery-1", files: [valid], dependencies: { ...dependencies, getCurrentAdmin: async () => null } });
  assert.equal(unauthorized.status, 401);
  const inactive = await createUploadSession({ galleryId: "gallery-1", files: [valid], dependencies: sessionDependencies({ gallery: { id: "gallery-1", isActive: false } }) });
  assert.equal(inactive.status, 404);
});

test("presigned URL failure rolls back the session and all file records", async () => {
  const dependencies = sessionDependencies({ sign: async () => { throw new Error("presigner unavailable"); } });
  await assert.rejects(createUploadSession({ galleryId: "gallery-1", files: [valid, { ...valid, filename: "second.jpg" }], dependencies }), /presigner unavailable/);
  assert.equal(dependencies.state.rolledBack, true);
  assert.deepEqual(dependencies.state.sessions, []);
  assert.deepEqual(dependencies.state.files, []);
});
