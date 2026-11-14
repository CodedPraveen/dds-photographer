import { createHash } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_COOLDOWN_MS = 60 * 60 * 1000;
const hashKey = (key) => createHash("sha256").update(String(key)).digest("hex");
export function cooldownForFailures(failures, now = new Date()) {
  return failures > 5
    ? new Date(
        now.getTime() + Math.min(MAX_COOLDOWN_MS, 1000 * 2 ** (failures - 5)),
      )
    : null;
}

export async function checkLoginRateLimit(prisma, key, now = new Date()) {
  const rows = await prisma.$queryRaw`
    SELECT "windowStartedAt", "failures", "cooldownUntil"
    FROM "AdminLoginRateLimit" WHERE "keyHash" = ${hashKey(key)}
  `;
  const record = rows[0];
  if (!record) return { allowed: true };
  if (new Date(record.windowStartedAt).getTime() + WINDOW_MS <= now.getTime())
    return { allowed: true };
  const cooldown =
    record.cooldownUntil && new Date(record.cooldownUntil).getTime();
  return cooldown && cooldown > now.getTime()
    ? { allowed: false, retryAfter: cooldown - now.getTime() }
    : { allowed: true };
}

export async function recordFailedLogin(prisma, key, now = new Date()) {
  const keyHash = hashKey(key);
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "AdminLoginRateLimit" ("keyHash", "windowStartedAt", "failures", "updatedAt")
      VALUES (${keyHash}, ${now}, 0, ${now}) ON CONFLICT ("keyHash") DO NOTHING
    `;
    const [record] = await tx.$queryRaw`
      SELECT "windowStartedAt", "failures" FROM "AdminLoginRateLimit"
      WHERE "keyHash" = ${keyHash} FOR UPDATE
    `;
    const reset =
      new Date(record.windowStartedAt).getTime() + WINDOW_MS <= now.getTime();
    const windowStartedAt = reset ? now : record.windowStartedAt;
    const failures = reset ? 1 : record.failures + 1;
    const cooldownUntil = cooldownForFailures(failures, now);
    await tx.$executeRaw`
      UPDATE "AdminLoginRateLimit" SET "windowStartedAt" = ${windowStartedAt},
      "failures" = ${failures}, "cooldownUntil" = ${cooldownUntil}, "updatedAt" = ${now}
      WHERE "keyHash" = ${keyHash}
    `;
  });
}

export async function clearLoginFailures(prisma, key) {
  await prisma.$executeRaw`DELETE FROM "AdminLoginRateLimit" WHERE "keyHash" = ${hashKey(key)}`;
}
