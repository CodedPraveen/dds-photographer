import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function getKey() {
  const value = process.env.ADMIN_TOTP_ENCRYPTION_KEY || "";
  if (!/^[0-9a-fA-F]{64}$/.test(value))
    throw new Error(
      "ADMIN_TOTP_ENCRYPTION_KEY must be 64 hexadecimal characters.",
    );
  return Buffer.from(value, "hex");
}

export function encryptTotpSecret(secret) {
  if (!secret) throw new Error("TOTP secret is required.");
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return [
    VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptTotpSecret(payload) {
  const [version, ivValue, tagValue, ciphertextValue] = String(
    payload || "",
  ).split(".");
  if (version !== VERSION || !ivValue || !tagValue || !ciphertextValue)
    throw new Error("Invalid encrypted TOTP secret.");
  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Unable to decrypt TOTP secret.");
  }
}
