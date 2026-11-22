import assert from "node:assert/strict";
import test from "node:test";

import { closePhotoProcessingQueue, PHOTO_PROCESSING_QUEUE_NAME } from "../src/lib/queue/photo-processing.mjs";
import { closePhotoWorker } from "../src/lib/queue/photo-worker.mjs";
import { closeRedisConnection, createProducerConnection, createWorkerConnection, parseRedisUrl } from "../src/lib/queue/redis.mjs";

test("parses valid Upstash TLS TCP URL", () => {
  const url = parseRedisUrl("rediss://default:secret@kind-firefly-210877.upstash.io:6379");
  assert.equal(url.protocol, "rediss:");
  assert.equal(url.hostname, "kind-firefly-210877.upstash.io");
  assert.equal(url.port, "6379");
});

test("rejects missing credentials, non-TLS URLs, and malformed scope", () => {
  assert.throws(() => parseRedisUrl(), /UPSTASH_REDIS_URL is required/);
  assert.throws(() => parseRedisUrl("redis://default:secret@example.com:6379"), /rediss/);
  assert.throws(() => parseRedisUrl("rediss://default:secret@example.com"), /port 6379/);
  assert.throws(() => parseRedisUrl("rediss://example.com:6379"), /username and password/);
  assert.throws(() => parseRedisUrl("rediss://default:secret@example.com:6380"), /port 6379/);
  assert.throws(() => parseRedisUrl("rediss://default:secret@example.com:6379/queue"), /path/);
});

test("queue and worker shutdown helpers are safe and await close", async () => {
  let redisClosed = false;
  let workerClosed = false;
  await closeRedisConnection({ status: "end", quit: async () => { redisClosed = true; } });
  await closeRedisConnection({ status: "ready", quit: async () => { redisClosed = true; } });
  await closePhotoWorker({ close: async () => { workerClosed = true; } });
  await closePhotoProcessingQueue();
  assert.equal(redisClosed, true);
  assert.equal(workerClosed, true);
});

test("defines one central photo-processing queue", () => {
  assert.equal(PHOTO_PROCESSING_QUEUE_NAME, "dds-photo-processing");
});

test("producer and worker use distinct retry policies", async () => {
  const url = "rediss://default:secret@example.com:6379";
  const producer = createProducerConnection(url);
  const worker = createWorkerConnection(url);
  assert.equal(producer.options.maxRetriesPerRequest, 1);
  assert.equal(worker.options.maxRetriesPerRequest, null);
  assert.equal(producer.options.keyPrefix, "");
  assert.equal(worker.options.keyPrefix, "");
  assert.equal(producer.options.retryStrategy(1), 250);
  assert.equal(producer.options.retryStrategy(3), 750);
  assert.equal(producer.options.retryStrategy(4), null);
  assert.equal(worker.options.retryStrategy(4), 2000);
  await producer.quit();
  await worker.quit();
});
