import "server-only";

import IORedis from "ioredis";

const REDIS_ENV = "UPSTASH_REDIS_URL";

export function parseRedisUrl(value = process.env[REDIS_ENV]) {
  if (!value) throw new Error(`${REDIS_ENV} is required.`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${REDIS_ENV} must be a valid rediss:// URL.`);
  }
  if (url.protocol !== "rediss:")
    throw new Error(`${REDIS_ENV} must use rediss:// TLS.`);
  if (!url.hostname) throw new Error(`${REDIS_ENV} must include a hostname.`);
  if (!url.username || !url.password)
    throw new Error(`${REDIS_ENV} must include Redis username and password.`);
  if (url.port !== "6379") {
    throw new Error(`${REDIS_ENV} must use port 6379.`);
  }
  if ((url.pathname && url.pathname !== "/") || url.search || url.hash)
    throw new Error(
      `${REDIS_ENV} must not include a path, query, or fragment.`,
    );
  return url;
}

export function createProducerConnection(value = process.env[REDIS_ENV]) {
  const url = parseRedisUrl(value);
  return new IORedis(url.toString(), {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    enableReadyCheck: true,
    retryStrategy: (attempt) =>
      attempt <= 3 ? Math.min(attempt * 250, 2000) : null,
  });
}

export function createWorkerConnection(value = process.env[REDIS_ENV]) {
  const url = parseRedisUrl(value);
  return new IORedis(url.toString(), {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    enableReadyCheck: true,
    retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
  });
}

export async function closeRedisConnection(connection) {
  if (connection && connection.status !== "end") await connection.quit();
}
