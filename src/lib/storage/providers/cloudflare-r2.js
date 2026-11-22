import "server-only";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getR2Config(env = process.env) {
  const endpoint = env.R2_ACCOUNT_ENDPOINT;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET_NAME;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2_ACCOUNT_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are required.",
    );
  }
  let parsedEndpoint;
  try {
    parsedEndpoint = new URL(endpoint);
  } catch {
    throw new Error("R2_ACCOUNT_ENDPOINT must be a valid HTTPS URL.");
  }
  if (
    parsedEndpoint.protocol !== "https:" ||
    parsedEndpoint.username ||
    parsedEndpoint.password ||
    parsedEndpoint.search ||
    parsedEndpoint.hash ||
    !/^[a-z0-9]+\.r2\.cloudflarestorage\.com$/i.test(parsedEndpoint.hostname)
  ) {
    throw new Error(
      "R2_ACCOUNT_ENDPOINT must be an HTTPS Cloudflare R2 endpoint without credentials, query, or fragment.",
    );
  }
  return {
    endpoint: parsedEndpoint.toString().replace(/\/$/, ""),
    accessKeyId,
    secretAccessKey,
    bucket,
  };
}

export function buildVersionedObjectKey({
  galleryId,
  photoId,
  versionId,
  derivative,
}) {
  for (const [name, value] of Object.entries({
    galleryId,
    photoId,
    versionId,
  })) {
    if (typeof value !== "string" || !value || value.includes("/"))
      throw new Error(`Invalid ${name} for R2 object key.`);
  }
  const derivativeKeys = {
    download: "download.jpg",
    gallery: "gallery.webp",
    thumbnail: "thumbnail.webp",
  };
  if (derivative !== undefined && !(derivative in derivativeKeys))
    throw new Error("Invalid derivative for R2 object key.");
  return `galleries/${galleryId}/${photoId}/versions/${versionId}/${derivative === undefined ? "original.jpg" : derivativeKeys[derivative]}`;
}

function createDefaultClient(config) {
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function createR2Storage({ client, config = getR2Config() } = {}) {
  const r2Client = client || createDefaultClient(config);
  return {
    async startMultipart(key) {
      const { UploadId } = await r2Client.send(
        new CreateMultipartUploadCommand({
          Bucket: config.bucket,
          Key: key,
          ContentType: "image/jpeg",
        }),
      );
      if (!UploadId) throw new Error("R2 did not return an upload ID.");
      return UploadId;
    },
    signPart({ key, uploadId, partNumber, size, expiresIn }) {
      return getSignedUrl(
        r2Client,
        new UploadPartCommand({
          Bucket: config.bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          ContentLength: size,
        }),
        { expiresIn, signableHeaders: new Set(["content-length"]) },
      );
    },
    async listParts(key, uploadId) {
      const parts = [];
      let marker;
      do {
        const result = await r2Client.send(
          new ListPartsCommand({
            Bucket: config.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumberMarker: marker,
          }),
        );
        parts.push(...(result.Parts ?? []));
        marker = result.IsTruncated ? result.NextPartNumberMarker : undefined;
        if (result.IsTruncated && !marker)
          throw new Error("Invalid R2 part pagination.");
      } while (marker);
      return parts;
    },
    finishMultipart(key, uploadId, parts) {
      return r2Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: config.bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }),
      );
    },
    async abortMultipart(key, uploadId) {
      try {
        await r2Client.send(
          new AbortMultipartUploadCommand({
            Bucket: config.bucket,
            Key: key,
            UploadId: uploadId,
          }),
        );
      } catch (error) {
        if (error.name !== "NoSuchUpload") throw error;
      }
    },
    async uploadFile({ key, body, contentType, metadata }) {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          Metadata: metadata,
        }),
      );
      return { key, provider: "R2" };
    },
    async createUploadUrl({ key, contentType, expiresIn = 900 }) {
      if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 900) {
        throw new Error(
          "R2 upload URL expiry must be between 1 and 900 seconds.",
        );
      }
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: contentType,
      });
      return getSignedUrl(r2Client, command, { expiresIn });
    },
    async objectExists(key) {
      try {
        await r2Client.send(
          new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
        );
        return true;
      } catch (error) {
        if (
          error?.$metadata?.httpStatusCode === 404 ||
          error?.name === "NotFound"
        )
          return false;
        throw error;
      }
    },
    async getMetadata(key) {
      const response = await r2Client.send(
        new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
      );
      return {
        key,
        sizeBytes: response.ContentLength ?? null,
        contentType: response.ContentType ?? null,
        etag: response.ETag ?? null,
        metadata: response.Metadata ?? {},
      };
    },
    async deleteFile(key) {
      await r2Client.send(
        new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
      );
    },
    async downloadFile(key) {
      const response = await r2Client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      );
      if (!response.Body) throw new Error("R2 returned an empty file.");
      return response.Body.transformToWebStream();
    },
  };
}

let storage;
function getStorage() {
  return (storage ||= createR2Storage());
}
export const multipartStorage = () => getStorage();
export const uploadFile = (options) => getStorage().uploadFile(options);
export const objectExists = (key) => getStorage().objectExists(key);
export const getMetadata = (key) => getStorage().getMetadata(key);
export const deleteFile = (key) => getStorage().deleteFile(key);
export const downloadFile = (key) => getStorage().downloadFile(key);
