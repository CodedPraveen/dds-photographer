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
import GalleryMediaManager from "@/features/admin/components/GalleryMediaManager";

export default async function GalleryAdminPage({ params }) {
  await requireAdmin();

  const { id } = await params;

  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          media: true,
          visitors: true,
        },
      },
    },
  });

  if (!gallery) notFound();

  const token = gallery.isActive
    ? await createGalleryLinkToken(gallery)
    : null;

  const galleryUrl = token
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/gallery/${encodeURIComponent(token)}`
    : null;

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/galleries" className="admin-back-link">
            ← All galleries
          </Link>

          <h1>{gallery.title}</h1>
          <p>Manage gallery details and private access.</p>
        </div>

        <span
          className={`admin-status ${gallery.isActive ? "is-active" : "is-inactive"
            }`}
        >
          {gallery.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="gallery-stats-grid">
        <div className="admin-card gallery-stat-card">
          <span>Photos</span>
          <strong>{gallery._count.media}</strong>
        </div>

        <div className="admin-card gallery-stat-card">
          <span>Visitors</span>
          <strong>{gallery._count.visitors}</strong>
        </div>

        <div className="admin-card gallery-stat-card">
          <span>Token version</span>
          <strong>{gallery.tokenVersion}</strong>
        </div>
      </div>

      <GalleryMediaManager galleryId={gallery.id} />

      <section className="admin-card gallery-detail-card">
        <div className="admin-section-heading">
          <div>
            <h2>Gallery settings</h2>
            <p>Update the title and access status.</p>
          </div>
        </div>

        <form action={updateGallery.bind(null, id)} className="gallery-edit-form">
          <label className="gallery-field">
            <span>Gallery title</span>
            <input
              className="admin-input"
              name="title"
              defaultValue={gallery.title}
              maxLength={160}
              required
            />
          </label>

          <label className="gallery-checkbox-field">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={gallery.isActive}
            />
            <span>Allow visitors to access this gallery</span>
          </label>

          <div className="gallery-detail-meta">
            <span>
              Created: {gallery.createdAt.toLocaleString("en-IN")}
            </span>
            <span>
              Last updated: {gallery.updatedAt.toLocaleString("en-IN")}
            </span>
          </div>

          <button className="admin-primary-button" type="submit">
            Save changes
          </button>
        </form>
      </section>

      <section className="admin-card gallery-detail-card">
        <div className="admin-section-heading">
          <div>
            <h2>Private gallery link</h2>
            <p>
              Share this link with clients to give them access to the gallery.
            </p>
          </div>
        </div>

        {galleryUrl ? (
          <div className="gallery-private-link">
            <a href={galleryUrl} target="_blank" rel="noreferrer">
              {galleryUrl}
            </a>
          </div>
        ) : (
          <div className="gallery-warning-message">
            This gallery is inactive. Its private link is currently unavailable.
          </div>
        )}

        <form action={revokeGallery.bind(null, id)}>
          <button
            className="admin-secondary-button"
            type="submit"
            disabled={!gallery.isActive}
          >
            Revoke gallery access
          </button>
        </form>
      </section>

      <section className="admin-card gallery-danger-card">
        <div>
          <h2>Delete gallery</h2>
          <p>
            Permanently delete this gallery and its related database records.
            This action cannot be undone.
          </p>
        </div>

        <form action={deleteGallery.bind(null, id)}>
          <button className="admin-danger-button" type="submit">
            Delete gallery
          </button>
        </form>
      </section>
    </main>
  );
}
