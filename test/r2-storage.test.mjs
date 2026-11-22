import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVersionedObjectKey,
  createR2Storage,
  getR2Config,
} from "../src/lib/storage/providers/cloudflare-r2.js";

const config = {
  endpoint: "https://account.r2.cloudflarestorage.com",
  accessKeyId: "key",
  secretAccessKey: "secret",
  bucket: "private-bucket",
};

test("R2 configuration validates required private endpoint settings", () => {
  assert.equal(getR2Config({ ...config, R2_ACCOUNT_ENDPOINT: config.endpoint, R2_ACCESS_KEY_ID: "key", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_NAME: "bucket" }).bucket, "bucket");
  assert.throws(() => getR2Config({}), /required/);
  assert.throws(() => getR2Config({ R2_ACCOUNT_ENDPOINT: "http://example.test", R2_ACCESS_KEY_ID: "key", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_NAME: "bucket" }), /HTTPS/);
});

test("R2 versioned keys are gallery scoped and reject path injection", () => {
  assert.equal(buildVersionedObjectKey({ galleryId: "g1", photoId: "p1", versionId: "v1" }), "galleries/g1/p1/versions/v1/original.jpg");
  assert.equal(buildVersionedObjectKey({ galleryId: "g1", photoId: "p1", versionId: "v1", derivative: "gallery" }), "galleries/g1/p1/versions/v1/gallery.bin");
  assert.throws(() => buildVersionedObjectKey({ galleryId: "g1/x", photoId: "p1", versionId: "v1" }), /Invalid galleryId/);
});

test("R2 adapter writes, reads metadata, checks existence, and deletes through mocked commands", async () => {
  const calls = [];
  const client = { send: async (command) => { calls.push(command); if (command.constructor.name === "HeadObjectCommand") return { ContentLength: 12, ContentType: "image/jpeg", ETag: "etag", Metadata: { sha256: "hash" } }; if (command.constructor.name === "GetObjectCommand") return { Body: { transformToWebStream: () => "stream" } }; return {}; } };
  const storage = createR2Storage({ client, config });
  assert.deepEqual(await storage.uploadFile({ key: "k", body: "body", contentType: "image/jpeg" }), { key: "k", provider: "R2" });
  assert.equal(await storage.objectExists("k"), true);
  assert.deepEqual(await storage.getMetadata("k"), { key: "k", sizeBytes: 12, contentType: "image/jpeg", etag: "etag", metadata: { sha256: "hash" } });
  assert.equal(await storage.downloadFile("k"), "stream");
  await storage.deleteFile("k");
  assert.deepEqual(calls.map((command) => command.constructor.name), ["PutObjectCommand", "HeadObjectCommand", "HeadObjectCommand", "GetObjectCommand", "DeleteObjectCommand"]);
});

test("R2 existence check preserves non-not-found errors", async () => {
  const storage = createR2Storage({ client: { send: async () => { const error = new Error("denied"); error.$metadata = { httpStatusCode: 403 }; throw error; } }, config });
  await assert.rejects(storage.objectExists("private/key"), /denied/);
});
