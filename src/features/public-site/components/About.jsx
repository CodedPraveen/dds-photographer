import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./About.module.css";

export function About({ content }) {
  return (
    <Section className={styles.section} id="about">
      <Container>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <Text as="p" className={styles.eyebrow} size="caption" tone="muted">
              {content.eyebrow} · temporary content
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
          </div>

          <figure className={styles.figure}>
            <Image
              alt="Temporary abstract image for the About section"
              className={styles.image}
              fill
              sizes="(max-width: 767px) 100vw, 46vw"
              src="/placeholders/portfolio-04.svg"
            />
            <figcaption className={styles.caption}>
              Temporary studio image
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}
