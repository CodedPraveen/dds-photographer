import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteGallery,
  revokeGallery,
  updateGallery,
} from "@/features/admin/server/actions";
import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";
import { createGalleryLinkToken } from "@/features/private-gallery/server/gallery-access";

export default async function GalleryAdminPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id } });
  if (!gallery) notFound();
  const token = gallery.isActive ? await createGalleryLinkToken(gallery) : null;
  const galleryUrl = token
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/gallery/${encodeURIComponent(token)}`
    : null;
  return (
    <main style={{ maxWidth: 700, margin: "3rem auto", padding: "2rem" }}>
      <Link href="/admin/galleries">← Galleries</Link>
      <h1>Edit gallery</h1>
      <form action={updateGallery.bind(null, id)}>
        <label>
          Title
          <input
            name="title"
            defaultValue={gallery.title}
            maxLength={160}
            required
          />
        </label>
        <label>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={gallery.isActive}
          />{" "}
          Active
        </label>
        <p>
          Created {gallery.createdAt.toISOString()} · Token version{" "}
          {gallery.tokenVersion}
        </p>
        <button>Save changes</button>
      </form>
      {galleryUrl ? (
        <p>
          Private link: <a href={galleryUrl}>{galleryUrl}</a>
        </p>
      ) : (
        <p>This gallery is revoked and has no active private link.</p>
      )}
      <form action={revokeGallery.bind(null, id)}>
        <button disabled={!gallery.isActive}>Revoke access</button>
      </form>
      <form action={deleteGallery.bind(null, id)}>
        <button>Delete gallery</button>
      </form>
    </main>
  );
}
