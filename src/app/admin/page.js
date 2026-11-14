import Link from "next/link";

import { logout } from "@/features/admin/server/actions";
import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function AdminPage() {
  await requireAdmin();
  const [total, active, recent] = await Promise.all([
    prisma.gallery.count(),
    prisma.gallery.count({ where: { isActive: true } }),
    prisma.gallery.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return (
    <main style={{ maxWidth: 1000, margin: "3rem auto", padding: "2rem" }}>
      <header>
        <p>DDS Photographer · Admin</p>
        <h1>Workspace overview</h1>
        <form action={logout}>
          <button>Log out</button>
        </form>
      </header>
      <p>
        Total galleries: {total} · Active: {active}
      </p>
      <p>
        <Link href="/admin/galleries">Manage galleries</Link>
      </p>
      <h2>Recent galleries</h2>
      <ul>
        {recent.map((gallery) => (
          <li key={gallery.id}>
            <Link href={`/admin/galleries/${gallery.id}`}>{gallery.title}</Link>{" "}
            — {gallery.isActive ? "Active" : "Inactive"}
          </li>
        ))}
      </ul>
    </main>
  );
}
