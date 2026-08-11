import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MINIMUM_SECRET_LENGTH = 32;
const DEVELOPMENT_SECRET_PATH = path.join(
  process.cwd(),
  ".data",
  "private-gallery",
  "signing-secret",
);

let secretPromise;

async function readOrCreateDevelopmentSecret() {
  try {
    return (await readFile(DEVELOPMENT_SECRET_PATH, "utf8")).trim();
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const generatedSecret = randomBytes(48).toString("base64url");
  await mkdir(path.dirname(DEVELOPMENT_SECRET_PATH), { recursive: true });

  try {
    await writeFile(DEVELOPMENT_SECRET_PATH, generatedSecret, {
      encoding: "utf8",
      flag: "wx",
    });
    return generatedSecret;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
    return (await readFile(DEVELOPMENT_SECRET_PATH, "utf8")).trim();
  }
}

export function getGallerySigningSecret() {
  if (secretPromise) {
    return secretPromise;
  }

  secretPromise = (async () => {
    const configuredSecret = process.env.GALLERY_TOKEN_SECRET?.trim();
    if (configuredSecret) {
      if (configuredSecret.length < MINIMUM_SECRET_LENGTH) {
        throw new Error(
          "GALLERY_TOKEN_SECRET must contain at least 32 characters.",
        );
      }
      return configuredSecret;
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("GALLERY_TOKEN_SECRET is required in production.");
    }

    return readOrCreateDevelopmentSecret();
  })();

  return secretPromise;
}
