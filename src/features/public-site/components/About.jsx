import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Link } from "@/components/ui/link/Link";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./About.module.css";

export function About({ content }) {
  return (
    <Section className={styles.section} id="about">
      <Container className={styles.content}>
        <div className={styles.layout}>
          <div className={styles.copy} data-motion-reveal>
            <Text as="p" className={styles.eyebrow} size="caption" tone="muted">
              {content.eyebrow} · photographer profile
            </Text>
            <Heading as="h2" className={styles.title}>
              {content.title}
            </Heading>
            <div className={styles.body}>
              {content.body.map((paragraph) => (
                <Text as="p" key={paragraph} tone="muted">
                  {paragraph}
                </Text>
              ))}
            </div>
            <Link className={styles.cta} href="#portfolio">
              View selected work <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <figure className={styles.figure} data-motion-reveal>
            <Image
              alt="Placeholder image for the photographer profile"
              className={styles.image}
              fill
              sizes="(max-width: 767px) 100vw, 46vw"
              src={content.image}
            />
            <figcaption className={styles.caption}>
              {content.imageCaption}
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}
