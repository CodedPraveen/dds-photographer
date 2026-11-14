import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { cooldownForFailures } from "../src/features/admin/server/rate-limit.mjs";
import {
  createTotpSecret,
  verifyTotp,
} from "../src/features/admin/server/totp.mjs";
import {
  decryptTotpSecret,
  encryptTotpSecret,
} from "../src/features/admin/server/totp-secrets.mjs";

test("rate limiting starts after five failures and caps cooldown", () => {
  const now = new Date(1_000_000);
  assert.equal(cooldownForFailures(5, now), null);
  assert.equal(cooldownForFailures(6, now).getTime(), 1_002_000);
  assert.equal(
    cooldownForFailures(100, now).getTime(),
    1_000_000 + 60 * 60 * 1000,
  );
});

test("TOTP accepts the current code and rejects malformed input", () => {
  const secret = createTotpSecret();
  const now = 1_735_689_600_000;
  const counter = Math.floor(now / 30_000);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of secret)
    bits += alphabet.indexOf(character).toString(2).padStart(5, "0");
  const key = Buffer.from(
    Array.from({ length: Math.floor(bits.length / 8) }, (_, index) =>
      parseInt(bits.slice(index * 8, index * 8 + 8), 2),
    ),
  );
  const data = Buffer.alloc(8);
  data.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(data).digest();
  const offset = digest[digest.length - 1] & 15;
  const code = String(
    (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000,
  ).padStart(6, "0");

  assert.equal(verifyTotp(secret, code, now), true);
  assert.equal(verifyTotp(secret, "12345", now), false);
});

test("TOTP secrets use authenticated encryption with unique IVs", () => {
  process.env.ADMIN_TOTP_ENCRYPTION_KEY = "11".repeat(32);
  const first = encryptTotpSecret("JBSWY3DPEHPK3PXP");
  const second = encryptTotpSecret("JBSWY3DPEHPK3PXP");
  assert.notEqual(first, second);
  assert.equal(decryptTotpSecret(first), "JBSWY3DPEHPK3PXP");
  assert.throws(() => decryptTotpSecret(`${first}x`));
});
