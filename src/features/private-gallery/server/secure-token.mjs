import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function sign(encodedPayload, secret) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createSignedToken(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function readSignedToken(token, secret) {
  if (typeof token !== "string" || token.length > 2048) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  const expectedSignature = sign(parts[0], secret);
  const supplied = Buffer.from(parts[1]);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function createNonce() {
  return randomBytes(24).toString("base64url");
}
