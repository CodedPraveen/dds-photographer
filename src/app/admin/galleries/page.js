
import Link from "next/link";

import GalleryList from "@/features/admin/components/GalleryList";
import { createGallery } from "@/features/admin/server/actions";
import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function GalleriesPage() {
  await requireAdmin();

  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          media: true,
          visitors: true,
        },
      },
    },
  });

  const activeCount = galleries.filter((gallery) => gallery.isActive).length;
  const inactiveCount = galleries.length - activeCount;

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin" className="admin-back-link">
            ← Overview
          </Link>

          <h1>Galleries</h1>
          <p>Manage private galleries, photos and visitor access.</p>
        </div>

        <span className="admin-page-count">
          {galleries.length} total galleries
        </span>
      </div>

      <div className="gallery-stats-grid">
        <div className="admin-card gallery-stat-card">
          <span>Total galleries</span>
          <strong>{galleries.length}</strong>
        </div>

        <div className="admin-card gallery-stat-card">
          <span>Active galleries</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="admin-card gallery-stat-card">
          <span>Inactive galleries</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      <section className="admin-card gallery-create-card">
        <div>
          <h2>Create a gallery</h2>
          <p>Start a new private gallery for your clients.</p>
        </div>

        <form action={createGallery} className="gallery-create-form">
          <input
            className="admin-input"
            name="title"
            placeholder="Enter gallery title"
            required
            maxLength={160}
          />

          <button className="admin-primary-button" type="submit">
            + Create gallery
          </button>
        </form>
      </section>

      <div className="admin-section-heading">
        <div>
          <h2>All galleries</h2>
          <p>Search and manage your existing galleries.</p>
        </div>
      </div>

      <GalleryList
        galleries={galleries.map((gallery) => ({
          ...gallery,
          createdAt: gallery.createdAt.toISOString(),
          updatedAt: gallery.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
