import Image from "next/image";

import styles from "./PrivateGallery.module.css";

export function PrivateGallery({ gallery, token }) {
  return (
    <main className={styles.galleryPage}>
      <header className={styles.galleryHeader}>
        <div>
          <p className={styles.eyebrow}>DDS Photographer · Private gallery</p>
          <h1 className={styles.galleryHeading}>{gallery.title}</h1>
        </div>
        <p className={styles.privateNote}>Private access</p>
      </header>

      {gallery.media.length ? (
        <section
          aria-label="Private photographs"
          className={styles.galleryGrid}
        >
          {gallery.media.map((item, index) => (
            <figure className={styles.galleryItem} key={item.id}>
              <Image
                alt={item.altText}
                className={styles.galleryImage}
                fill
                loading={index < 3 ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                src={`/gallery/${encodeURIComponent(token)}/media/${encodeURIComponent(item.id)}`}
                unoptimized
              />
            </figure>
          ))}
        </section>
      ) : (
        <p className={styles.emptyGallery}>
          This gallery is ready, but its photographs have not been added yet.
        </p>
      )}
    </main>
  );
}
