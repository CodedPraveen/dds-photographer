import assert from "node:assert/strict";
import test from "node:test";

import { MAX_ORIGINAL_SIZE, SESSION_TTL_MS, UPLOAD_URL_TTL_SECONDS, validateUploadFileInput } from "../src/features/admin/server/upload-policy.js";

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
