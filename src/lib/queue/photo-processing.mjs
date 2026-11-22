import "server-only";

import { Queue } from "bullmq";

import { closeRedisConnection, createProducerConnection } from "./redis.mjs";

export const PHOTO_PROCESSING_QUEUE_NAME = "dds-photo-processing";

let queue;

export function getPhotoProcessingQueue() {
  if (!queue) queue = new Queue(PHOTO_PROCESSING_QUEUE_NAME, { connection: createProducerConnection() });
  return queue;
}

export async function closePhotoProcessingQueue() {
  if (!queue) return;
  await queue.close();
  queue = undefined;
}

export { closeRedisConnection };
