import Image from "next/image";

import { VisuallyHidden } from "@/components/ui/visually-hidden/VisuallyHidden";

import styles from "./Hero.module.css";

export function Hero({ content, items }) {
  return (
    <section className={styles.hero} data-motion-hero id="home">
      <Image
        alt={content.imageAlt}
        className={styles.backgroundImage}
        fill
        priority
        sizes="100vw"
        src={content.image}
      />
      <div aria-hidden="true" className={styles.backgroundVeil} />

      <div className={styles.stage}>
        <VisuallyHidden>
          <h1>DDS Photographer — camera to memories</h1>
        </VisuallyHidden>

        <p className={styles.brandMark}>DDS Photographer</p>

        <div
          aria-label="Featured photographs emerging from the camera"
          className={styles.photoStack}
        >
          {items.map((item, index) => (
            <figure
              className={styles.photoCard}
              data-motion-photo
              data-photo-index={index}
              key={item.id}
            >
              <Image
                alt={item.altText}
                className={styles.photo}
                fill
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 767px) 48vw, 24vw"
                src={item.mediaUrl}
              />
            </figure>
          ))}
        </div>

        <p className={styles.storyCue}>
          <span>Camera</span>
          <span aria-hidden="true">→</span>
          <span>Memories</span>
        </p>

        <a
          aria-label="Continue to About"
          className={styles.scrollCue}
          href="#about"
        >
          Scroll to begin
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
