
import Link from "next/link";

import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

const metrics = [
  { label: "Total galleries", key: "galleries", icon: "▧" },
  { label: "Active galleries", key: "active", icon: "◉" },
  { label: "Total photos", key: "photos", icon: "▣" },
  { label: "Registered visitors", key: "visitors", icon: "♙" },
];

export default async function AdminPage() {
  await requireAdmin();

  const [galleries, active, photos, visitors, recent] =
    await Promise.all([
      prisma.gallery.count(),
      prisma.gallery.count({ where: { isActive: true } }),
      prisma.galleryMedia.count(),
      prisma.galleryVisitor.count(),
      prisma.gallery.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { media: true } } },
      }),
    ]);

  const values = { galleries, active, photos, visitors };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-gray-500">STUDIO OVERVIEW</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Welcome to your workspace
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Manage your galleries, photos and studio activity.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <span className="text-xl text-amber-700">{metric.icon}</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-gray-900">
              {values[metric.key].toLocaleString("en-IN")}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Recent galleries
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your latest gallery activity
              </p>
            </div>
            <Link
              href="/admin/galleries"
              className="text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-gray-100">
            {recent.length ? (
              recent.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/admin/galleries/${gallery.id}`}
                  className="flex items-center justify-between gap-4 py-4 no-underline"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {gallery.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {gallery._count.media} photos
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${gallery.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {gallery.isActive ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-8 text-sm text-gray-500">
                No galleries created yet.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">System overview</h3>
          <p className="mt-1 text-sm text-gray-500">
            More insights will become available as tracking is implemented.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Storage monitoring
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Waiting for storage provider integration.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Visitor analytics
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Page-view tracking is not configured yet.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Security activity
              </p>
              <Link
                href="/admin/audit"
                className="mt-1 inline-block text-xs text-amber-700"
              >
                Review audit logs →
              </Link>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
