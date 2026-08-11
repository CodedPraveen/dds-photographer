import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../../generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = globalThis.__ddsPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ddsPrisma = prisma;
}

export async function findGalleryById(galleryId) {
  return prisma.gallery.findUnique({
    where: { id: galleryId },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function findVisitorById(visitorId) {
  return prisma.galleryVisitor.findUnique({
    where: { id: visitorId },
  });
}

export async function upsertGalleryVisitor(galleryId, visitorData) {
  const consentedAt = new Date();

  return prisma.galleryVisitor.upsert({
    where: {
      galleryId_email: {
        galleryId,
        email: visitorData.email,
      },
    },
    update: {
      name: visitorData.name,
      mobile: visitorData.mobile,
      consent: true,
      consentedAt,
    },
    create: {
      galleryId,
      name: visitorData.name,
      mobile: visitorData.mobile,
      email: visitorData.email,
      consent: true,
      consentedAt,
    },
  });
}
