import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import sharp from "sharp";

import { verifyUploadedObject } from "../src/features/admin/server/upload-verification.js";

const jpeg = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).jpeg().toBuffer();
const sha256 = createHash("sha256").update(jpeg).digest("hex");

test("verification accepts an unchanged JPEG and returns metadata", async () => {
  const result = await verifyUploadedObject({ bytes: jpeg, expectedSize: jpeg.length, expectedSha256: sha256 });
  assert.deepEqual(result, { sizeBytes: jpeg.length, sha256, width: 2, height: 2 });
});

test("verification rejects incorrect size and checksum", async () => {
  await assert.rejects(verifyUploadedObject({ bytes: jpeg, expectedSize: jpeg.length + 1, expectedSha256: sha256 }), /size/);
  await assert.rejects(verifyUploadedObject({ bytes: jpeg, expectedSize: jpeg.length, expectedSha256: "0".repeat(64) }), /checksum/);
});

test("verification rejects invalid JPEG content", async () => {
  const invalid = Buffer.from("not a jpeg");
  await assert.rejects(verifyUploadedObject({ bytes: invalid, expectedSize: invalid.length, expectedSha256: "" }), /JPEG|unsupported image format/);
});

test("verification enforces the 50 MB original limit", async () => {
  await assert.rejects(verifyUploadedObject({ bytes: jpeg, expectedSize: 50 * 1024 * 1024 + 1, expectedSha256: sha256 }), /size/);
});
