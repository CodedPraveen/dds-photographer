import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  HardDrive,
  Image,
  Images,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";

export default async function AdminPage() {
  await requireAdmin();

  const [galleries, active, photos, visitors, recent] = await Promise.all([
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

  const metrics = [
    {
      label: "Total galleries",
      value: galleries,
      icon: Images,
      description: "All created galleries",
    },
    {
      label: "Active galleries",
      value: active,
      icon: CheckCircle2,
      description: "Currently available",
    },
    {
      label: "Total photos",
      value: photos,
      icon: Image,
      description: "Photos in your library",
    },
    {
      label: "Registered visitors",
      value: visitors,
      icon: Users,
      description: "Gallery visitors",
    },
  ];

  return (
    <div className="admin-dashboard space-y-8">
      {/* Welcome header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-amber-700">
            STUDIO OVERVIEW
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your photography studio.
          </p>
        </div>

        <Link
          href="/admin/galleries"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-gray-700"
        >
          <Plus size={17} />
          Manage galleries
        </Link>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {metric.label}
                </span>
                <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                  <Icon size={20} />
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">
                {metric.value.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-gray-400">{metric.description}</p>
            </article>
          );
        })}
      </section>

      {/* Main dashboard content */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent galleries */}
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent galleries
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your latest created galleries
              </p>
            </div>

            <Link
              href="/admin/galleries"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 no-underline hover:text-amber-800"
            >
              View all <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-5 divide-y divide-gray-100">
            {recent.length > 0 ? (
              recent.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/admin/galleries/${gallery.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg py-4 no-underline transition hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
                      <Images size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {gallery.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {gallery._count.media} photos · Created{" "}
                        {new Date(gallery.createdAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      gallery.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {gallery.isActive ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center">
                <Images className="mx-auto text-gray-300" size={32} />
                <p className="mt-3 text-sm font-medium text-gray-700">
                  No galleries yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Your newly created galleries will appear here.
                </p>
                <Link
                  href="/admin/galleries"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-700 no-underline"
                >
                  Create your first gallery <ArrowUpRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </article>

        {/* Studio panel */}
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            Studio workspace
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your photography workspace.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/admin/galleries"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 no-underline transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <Images className="text-amber-700" size={20} />
              <span className="flex-1">
                <span className="block text-sm font-medium text-gray-800">
                  Gallery management
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Create and manage galleries
                </span>
              </span>
              <ArrowUpRight size={16} className="text-gray-400" />
            </Link>

            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <HardDrive className="text-amber-700" size={20} />
              <span>
                <span className="block text-sm font-medium text-gray-800">
                  Media storage
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {photos.toLocaleString("en-IN")} stored media records
                </span>
              </span>
            </div>

            <Link
              href="/admin/audit"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 no-underline transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <ShieldCheck className="text-amber-700" size={20} />
              <span className="flex-1">
                <span className="block text-sm font-medium text-gray-800">
                  Security activity
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Review admin audit logs
                </span>
              </span>
              <ArrowUpRight size={16} className="text-gray-400" />
            </Link>
          </div>

          <div className="mt-5 rounded-lg bg-gray-900 p-4 text-white">
            <Camera size={22} className="text-amber-400" />
            <p className="mt-3 text-sm font-semibold">
              Keep creating memories.
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-300">
              Your studio workspace is ready for your next project.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
