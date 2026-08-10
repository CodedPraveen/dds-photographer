import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Hero.module.css";

export function Hero({ content, items }) {
  return (
    <section className={styles.hero} data-motion-hero id="home">
      <Container className={styles.container}>
        <div className={styles.copy} data-motion-hero-copy>
          <Text as="p" className={styles.eyebrow} size="caption" tone="inverse">
            {content.eyebrow}
          </Text>
          <Heading as="h1" className={styles.title} size="display">
            {content.title}
          </Heading>
          <Text as="p" className={styles.description} tone="inverse">
            {content.description}
          </Text>
          <a className={styles.cta} href="#portfolio">
            View portfolio
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <figure className={styles.cameraFallback}>
          <div className={styles.cameraShell} data-motion-camera-fallback>
            <div className={styles.cameraTop} aria-hidden="true" />
            <div className={styles.cameraBody}>
              <div className={styles.viewfinder}>
                <Image
                  alt={content.imageAlt}
                  className={styles.image}
                  fill
                  priority
                  sizes="(max-width: 767px) 88vw, (max-width: 1279px) 52vw, 46vw"
                  src={content.image}
                />
              </div>
              <span aria-hidden="true" className={styles.dial} />
            </div>
          </div>

          <div aria-label="Featured photographs" className={styles.photoStack}>
            {items.map((item, index) => (
              <figure
                className={styles.photoCard}
                data-motion-photo
                key={item.id}
              >
                <Image
                  alt={item.altText}
                  className={styles.stackImage}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 767px) 74vw, 34vw"
                  src={item.mediaUrl}
                />
              </figure>
            ))}
          </div>

          <figcaption className={styles.caption}>
            Interactive camera preview · temporary local photography
          </figcaption>
        </figure>

        <a
          aria-label="Scroll to About"
          className={styles.scrollCue}
          href="#about"
        >
          Scroll
          <span aria-hidden="true">↓</span>
        </a>
      </Container>
    </section>
  );
}
