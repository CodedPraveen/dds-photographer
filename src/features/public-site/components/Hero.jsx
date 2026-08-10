import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Hero.module.css";

export function Hero({ content }) {
  return (
    <section className={styles.hero} id="home">
      <Container className={styles.container}>
        <div className={styles.copy}>
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
          <figcaption className={styles.caption}>
            Static Phase 2 camera fallback · interactive camera deferred to
            Phase 3
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
