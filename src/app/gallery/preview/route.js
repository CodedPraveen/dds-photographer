import { redirect } from "next/navigation";

import { createGalleryLinkToken } from "@/features/private-gallery/server/gallery-access";
import { ensureDevelopmentGallery } from "@/features/private-gallery/server/gallery-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
    return new Response("Not found", { status: 404 });
  }

  const gallery = await ensureDevelopmentGallery();
  const token = await createGalleryLinkToken(gallery);
  redirect(`/gallery/${encodeURIComponent(token)}`);
}
