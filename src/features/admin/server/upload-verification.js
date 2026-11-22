import "server-only";

import { createHash } from "node:crypto";

import sharp from "sharp";

export async function verifyUploadedObject({
  bytes,
  expectedSize,
  expectedSha256,
}) {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0)
    throw new Error("Uploaded object is empty.");
  if (bytes.length !== expectedSize || bytes.length > 50 * 1024 * 1024)
    throw new Error("Uploaded object size is invalid.");

  if (expectedSha256) {
    const actualSha256 = createHash("sha256").update(bytes).digest("hex");
    if (actualSha256.toLowerCase() !== expectedSha256.toLowerCase())
      throw new Error("Uploaded object checksum does not match.");
  }

  await sharp(bytes, { failOn: "error" }).rotate().toBuffer();
  const metadata = await sharp(bytes, { failOn: "error" }).metadata();
  if (metadata.format !== "jpeg")
    throw new Error("Uploaded object is not a valid JPEG.");
  return {
    sizeBytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}
