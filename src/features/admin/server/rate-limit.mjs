const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(key, now = Date.now()) {
  const record = attempts.get(key);
  if (!record) return { allowed: true };
  if (record.windowStartedAt + WINDOW_MS <= now) {
    attempts.delete(key);
    return { allowed: true };
  }
  if (record.cooldownUntil > now)
    return { allowed: false, retryAfter: record.cooldownUntil - now };
  return { allowed: true };
}

export function recordFailedLogin(key, now = Date.now()) {
  const previous = attempts.get(key);
  const record =
    previous && previous.windowStartedAt + WINDOW_MS > now
      ? previous
      : { windowStartedAt: now, failures: 0, cooldownUntil: 0 };
  record.failures += 1;
  if (record.failures > 5)
    record.cooldownUntil =
      now +
      Math.min(60 * 60 * 1000, 1000 * 2 ** Math.min(record.failures - 5, 10));
  attempts.set(key, record);
}

export function clearLoginFailures(key) {
  attempts.delete(key);
}
