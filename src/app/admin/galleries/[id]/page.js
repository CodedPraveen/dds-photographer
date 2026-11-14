import Link from "next/link";
import { notFound } from "next/navigation";

import { updateGallery } from "@/features/admin/server/actions";
import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function GalleryAdminPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id } });
  if (!gallery) notFound();
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
    </main>
  );
}
