import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordFailedLogin,
} from "../src/features/admin/server/rate-limit.mjs";
import {
  createTotpSecret,
  verifyTotp,
} from "../src/features/admin/server/totp.mjs";

test("login rate limiting enters progressive cooldown after five failures", () => {
  const key = `test-${Date.now()}-${Math.random()}`;
  const now = 1_000_000;

  for (let index = 0; index < 5; index += 1) {
    recordFailedLogin(key, now);
    assert.equal(checkLoginRateLimit(key, now).allowed, true);
  }

  recordFailedLogin(key, now);
  const limited = checkLoginRateLimit(key, now);
  assert.equal(limited.allowed, false);
  assert.ok(limited.retryAfter > 0);
  clearLoginFailures(key);
  assert.equal(checkLoginRateLimit(key, now).allowed, true);
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
