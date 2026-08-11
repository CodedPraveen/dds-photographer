import "server-only";

async function getRepository() {
  if (process.env.DATABASE_URL) {
    return import("./prisma-gallery-repository");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is required for private galleries in production.",
    );
  }

  return import("./local-gallery-repository");
}

export async function ensureDevelopmentGallery() {
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
    return null;
  }
  const repository = await getRepository();
  return repository.ensureDevelopmentGallery();
}

export async function findGalleryById(galleryId) {
  const repository = await getRepository();
  return repository.findGalleryById(galleryId);
}

export async function findVisitorById(visitorId) {
  const repository = await getRepository();
  return repository.findVisitorById(visitorId);
}

export async function upsertGalleryVisitor(galleryId, visitorData) {
  const repository = await getRepository();
  return repository.upsertGalleryVisitor(galleryId, visitorData);
}
