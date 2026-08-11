import { notFound } from "next/navigation";

import { GalleryEntry } from "@/features/private-gallery/components/GalleryEntry";
import { PrivateGallery } from "@/features/private-gallery/components/PrivateGallery";
import {
  getAuthorizedGalleryVisitor,
  resolveGalleryToken,
} from "@/features/private-gallery/server/gallery-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Private Gallery | DDS Photographer",
  description: "A private DDS Photographer client gallery.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function GalleryPage({ params }) {
  const { token } = await params;
  const gallery = await resolveGalleryToken(token);

  if (!gallery) {
    notFound();
  }

  const visitor = await getAuthorizedGalleryVisitor(gallery.id);

  if (!visitor) {
    return <GalleryEntry gallery={gallery} token={token} />;
  }

  return <PrivateGallery gallery={gallery} token={token} />;
}
