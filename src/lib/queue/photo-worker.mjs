import "server-only";

import { Worker } from "bullmq";

import { PHOTO_PROCESSING_QUEUE_NAME } from "./photo-processing.mjs";
import { createWorkerConnection } from "./redis.mjs";

export function createPhotoWorker(processor, options = {}) {
  return new Worker(PHOTO_PROCESSING_QUEUE_NAME, processor, {
    connection: createWorkerConnection(),
    ...options,
  });
}

export async function closePhotoWorker(worker) {
  if (worker) await worker.close();
}
