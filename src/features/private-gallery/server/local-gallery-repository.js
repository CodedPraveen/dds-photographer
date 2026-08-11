import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { upsertVisitorRecord } from "./local-gallery-records.mjs";

const DATABASE_PATH = path.join(
  process.cwd(),
  ".data",
  "private-gallery",
  "database.json",
);
const DEVELOPMENT_GALLERY_ID = "dds-phase-4-preview";
const DEVELOPMENT_MEDIA = Object.freeze([
  {
    id: "cover",
    storageKey: "development/cover",
    altText: "A quiet editorial wedding portrait",
    sortOrder: 0,
    isCover: true,
  },
  {
    id: "arrival",
    storageKey: "development/arrival",
    altText: "A cinematic wedding arrival",
    sortOrder: 1,
    isCover: false,
  },
  {
    id: "ceremony",
    storageKey: "development/ceremony",
    altText: "A warm ceremony moment",
    sortOrder: 2,
    isCover: false,
  },
  {
    id: "portraits",
    storageKey: "development/portraits",
    altText: "An editorial couple portrait",
    sortOrder: 3,
    isCover: false,
  },
]);

let operationQueue = Promise.resolve();

function withLock(operation) {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.catch(() => undefined);
  return result;
}

async function readDatabase() {
  try {
    return JSON.parse(await readFile(DATABASE_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return { galleries: [], visitors: [] };
    }
    throw error;
  }
}

async function writeDatabase(database) {
  await mkdir(path.dirname(DATABASE_PATH), { recursive: true });
  await writeFile(
    DATABASE_PATH,
    `${JSON.stringify(database, null, 2)}\n`,
    "utf8",
  );
}

function clone(value) {
  return value ? structuredClone(value) : null;
}

export async function ensureDevelopmentGallery() {
  return withLock(async () => {
    const database = await readDatabase();
    let gallery = database.galleries.find(
      (candidate) => candidate.id === DEVELOPMENT_GALLERY_ID,
    );

    if (!gallery) {
      const timestamp = new Date().toISOString();
      gallery = {
        id: DEVELOPMENT_GALLERY_ID,
        title: "A Private Celebration",
        isActive: true,
        tokenVersion: 1,
        opensAt: null,
        closesAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        media: DEVELOPMENT_MEDIA,
      };
      database.galleries.push(gallery);
      await writeDatabase(database);
    }

    return clone(gallery);
  });
}

export async function findGalleryById(galleryId) {
  const database = await readDatabase();
  return clone(
    database.galleries.find((gallery) => gallery.id === galleryId) ?? null,
  );
}

export async function findVisitorById(visitorId) {
  const database = await readDatabase();
  return clone(
    database.visitors.find((visitor) => visitor.id === visitorId) ?? null,
  );
}

export async function upsertGalleryVisitor(galleryId, visitorData) {
  return withLock(async () => {
    const database = await readDatabase();
    const timestamp = new Date().toISOString();
    const visitor = upsertVisitorRecord(database, galleryId, visitorData, {
      id: randomUUID(),
      timestamp,
    });

    await writeDatabase(database);
    return clone(visitor);
  });
}
