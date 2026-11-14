import Link from "next/link";

import { createGallery } from "@/features/admin/server/actions";
import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function GalleriesPage() {
  await requireAdmin();
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <main style={{ maxWidth: 1000, margin: "3rem auto", padding: "2rem" }}>
      <Link href="/admin">← Overview</Link>
      <h1>Galleries</h1>
      <form action={createGallery}>
        <label>
          New gallery title
          <input name="title" required maxLength={160} />
        </label>
        <button>Create gallery</button>
      </form>
      {galleries.length ? (
        <ul>
          {galleries.map((gallery) => (
            <li key={gallery.id}>
              <Link href={`/admin/galleries/${gallery.id}`}>
                {gallery.title}
              </Link>{" "}
              — {gallery.isActive ? "Active" : "Inactive"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No galleries yet.</p>
      )}
    </main>
  );
}
