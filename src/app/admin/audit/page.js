import Link from "next/link";

import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function AuditPage() {
  await requireAdmin();
  const events = await prisma.adminAuditEvent.findMany({
    include: { admin: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <main style={{ maxWidth: 1100, margin: "3rem auto", padding: "2rem" }}>
      <Link href="/admin">← Overview</Link>
      <h1>Audit events</h1>
      {events.length === 0 ? (
        <p>No audit events recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.createdAt.toISOString()}</td>
                <td>{event.admin?.email || "Deleted admin"}</td>
                <td>{event.action}</td>
                <td>{event.targetId || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
