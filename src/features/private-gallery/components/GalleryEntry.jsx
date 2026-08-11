import Image from "next/image";

import { GalleryEntryForm } from "./GalleryEntryForm";
import styles from "./PrivateGallery.module.css";

export function GalleryEntry({ gallery, token }) {
  const cover = gallery.media.find((item) => item.isCover) ?? gallery.media[0];

  return (
    <main className={styles.entryPage}>
      <section aria-label="Gallery introduction" className={styles.entryShell}>
        <div className={styles.photoPanel}>
          {cover ? (
            <Image
              alt={cover.altText}
              className={styles.coverImage}
              fill
              priority
              sizes="(min-width: 768px) 52vw, 100vw"
              src={`/gallery/${encodeURIComponent(token)}/media/${encodeURIComponent(cover.id)}`}
              unoptimized
            />
          ) : (
            <div aria-hidden="true" className={styles.emptyCover} />
          )}
          <div className={styles.photoShade} />
          <div className={styles.galleryIdentity}>
            <p>DDS Photographer</p>
            <h2>{gallery.title}</h2>
          </div>
        </div>
        <div className={styles.formPanel}>
          <GalleryEntryForm token={token} />
        </div>
      </section>
    </main>
  );
}
