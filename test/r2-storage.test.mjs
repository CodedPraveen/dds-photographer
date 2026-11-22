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
  assert.equal(
    getR2Config({
      ...config,
      R2_ACCOUNT_ENDPOINT: config.endpoint,
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
      R2_BUCKET_NAME: "bucket",
    }).bucket,
    "bucket",
  );
  assert.throws(() => getR2Config({}), /required/);
  assert.throws(
    () =>
      getR2Config({
        R2_ACCOUNT_ENDPOINT: "http://example.test",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET_NAME: "bucket",
      }),
    /HTTPS/,
  );
  for (const endpoint of [
    "https://example.com",
    "https://user:pass@account.r2.cloudflarestorage.com",
    "https://account.r2.cloudflarestorage.com?x=1",
    "https://account.r2.cloudflarestorage.com/#x",
  ]) {
    assert.throws(
      () =>
        getR2Config({
          R2_ACCOUNT_ENDPOINT: endpoint,
          R2_ACCESS_KEY_ID: "key",
          R2_SECRET_ACCESS_KEY: "secret",
          R2_BUCKET_NAME: "bucket",
        }),
      /Cloudflare R2 endpoint/,
    );
  }
});

test("R2 versioned keys are gallery scoped and reject path injection", () => {
  assert.equal(
    buildVersionedObjectKey({
      galleryId: "g1",
      photoId: "p1",
      versionId: "v1",
    }),
    "galleries/g1/p1/versions/v1/original.jpg",
  );
  assert.equal(
    buildVersionedObjectKey({
      galleryId: "g1",
      photoId: "p1",
      versionId: "v1",
      derivative: "download",
    }),
    "galleries/g1/p1/versions/v1/download.jpg",
  );
  assert.equal(
    buildVersionedObjectKey({
      galleryId: "g1",
      photoId: "p1",
      versionId: "v1",
      derivative: "gallery",
    }),
    "galleries/g1/p1/versions/v1/gallery.webp",
  );
  assert.equal(
    buildVersionedObjectKey({
      galleryId: "g1",
      photoId: "p1",
      versionId: "v1",
      derivative: "thumbnail",
    }),
    "galleries/g1/p1/versions/v1/thumbnail.webp",
  );
  assert.throws(
    () =>
      buildVersionedObjectKey({
        galleryId: "g1/x",
        photoId: "p1",
        versionId: "v1",
      }),
    /Invalid galleryId/,
  );
  assert.throws(
    () =>
      buildVersionedObjectKey({
        galleryId: "g1",
        photoId: "../p1",
        versionId: "v1",
      }),
    /Invalid photoId/,
  );
  assert.throws(
    () =>
      buildVersionedObjectKey({
        galleryId: "g1",
        photoId: "p1",
        versionId: "v1",
        derivative: "other",
      }),
    /Invalid derivative/,
  );
});

test("R2 adapter writes, reads metadata, checks existence, and deletes through mocked commands", async () => {
  const calls = [];
  const client = {
    send: async (command) => {
      calls.push(command);
      if (command.constructor.name === "HeadObjectCommand")
        return {
          ContentLength: 12,
          ContentType: "image/jpeg",
          ETag: "etag",
          Metadata: { sha256: "hash" },
        };
      if (command.constructor.name === "GetObjectCommand")
        return { Body: { transformToWebStream: () => "stream" } };
      return {};
    },
  };
  const storage = createR2Storage({ client, config });
  assert.deepEqual(
    await storage.uploadFile({
      key: "k",
      body: "body",
      contentType: "image/jpeg",
    }),
    { key: "k", provider: "R2" },
  );
  assert.equal(await storage.objectExists("k"), true);
  assert.deepEqual(await storage.getMetadata("k"), {
    key: "k",
    sizeBytes: 12,
    contentType: "image/jpeg",
    etag: "etag",
    metadata: { sha256: "hash" },
  });
  assert.equal(await storage.downloadFile("k"), "stream");
  await storage.deleteFile("k");
  assert.deepEqual(
    calls.map((command) => command.constructor.name),
    [
      "PutObjectCommand",
      "HeadObjectCommand",
      "HeadObjectCommand",
      "GetObjectCommand",
      "DeleteObjectCommand",
    ],
  );
});

test("R2 existence check preserves non-not-found errors", async () => {
  const storage = createR2Storage({
    client: {
      send: async () => {
        const error = new Error("denied");
        error.$metadata = { httpStatusCode: 403 };
        throw error;
      },
    },
    config,
  });
  await assert.rejects(storage.objectExists("private/key"), /denied/);
});

test("R2 multipart commands use the private bucket and paginate authoritative parts", async () => {
  const calls = [];
  const parts = [
    { PartNumber: 1, Size: 8 * 1024 * 1024, ETag: "first" },
    { PartNumber: 2, Size: 7, ETag: "last" },
  ];
  const client = {
    async send(command) {
      const name = command.constructor.name;
      calls.push([name, command.input]);
      if (name === "CreateMultipartUploadCommand")
        return { UploadId: "upload" };
      if (name === "ListPartsCommand")
        return command.input.PartNumberMarker === undefined
          ? { Parts: [parts[0]], IsTruncated: true, NextPartNumberMarker: "1" }
          : { Parts: [parts[1]], IsTruncated: false };
      if (
        name === "AbortMultipartUploadCommand" &&
        command.input.UploadId === "gone"
      ) {
        throw Object.assign(new Error("gone"), { name: "NoSuchUpload" });
      }
      return {};
    },
  };
  const storage = createR2Storage({ client, config });
  const key = "original.jpg";
  const common = { Bucket: config.bucket, Key: key };
  assert.equal(await storage.startMultipart(key), "upload");
  assert.deepEqual(await storage.listParts(key, "upload"), parts);
  const manifest = parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag }));
  await storage.finishMultipart(key, "upload", manifest);
  await storage.abortMultipart(key, "upload");
  await storage.abortMultipart(key, "gone");
  assert.deepEqual(calls, [
    ["CreateMultipartUploadCommand", { ...common, ContentType: "image/jpeg" }],
    [
      "ListPartsCommand",
      { ...common, UploadId: "upload", PartNumberMarker: undefined },
    ],
    [
      "ListPartsCommand",
      { ...common, UploadId: "upload", PartNumberMarker: "1" },
    ],
    [
      "CompleteMultipartUploadCommand",
      { ...common, UploadId: "upload", MultipartUpload: { Parts: manifest } },
    ],
    ["AbortMultipartUploadCommand", { ...common, UploadId: "upload" }],
    ["AbortMultipartUploadCommand", { ...common, UploadId: "gone" }],
  ]);
});

test("UploadPart signing binds the part number, upload ID, expiry and Content-Length", async () => {
  const storage = createR2Storage({ config });
  const input = {
    key: "original.jpg",
    uploadId: "upload",
    partNumber: 2,
    size: 8 * 1024 * 1024,
    expiresIn: 60,
  };
  const url = new URL(await storage.signPart(input));
  assert.equal(url.searchParams.get("partNumber"), "2");
  assert.equal(url.searchParams.get("uploadId"), "upload");
  assert.equal(url.searchParams.get("X-Amz-Expires"), "60");
  assert.match(
    url.searchParams.get("X-Amz-SignedHeaders"),
    /\bcontent-length\b/,
  );
  assert.equal(
    [...url.searchParams.keys()].some((key) =>
      key.toLowerCase().startsWith("x-amz-checksum-"),
    ),
    false,
  );
  const other = new URL(
    await storage.signPart({ ...input, size: input.size - 1 }),
  );
  assert.notEqual(
    url.searchParams.get("X-Amz-Signature"),
    other.searchParams.get("X-Amz-Signature"),
  );
});

test("R2 signed upload URL is generated server-side with a bounded expiry", async () => {
  const storage = createR2Storage({
    client: new (await import("@aws-sdk/client-s3")).S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: { accessKeyId: "key", secretAccessKey: "secret" },
    }),
    config,
  });
  const url = await storage.createUploadUrl({
    key: "galleries/g1/p1/versions/v1/original.jpg",
    contentType: "image/jpeg",
    expiresIn: 900,
  });
  assert.match(url, /X-Amz-Expires=900/);
  await assert.rejects(
    storage.createUploadUrl({
      key: "k",
      contentType: "image/jpeg",
      expiresIn: 901,
    }),
    /between 1 and 900/,
  );
});
