import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Portfolio.module.css";

export function Portfolio({ items }) {
  const activeItems = items
    .filter((item) => item.isActive)
    .sort((first, second) => first.sortOrder - second.sortOrder);

  return (
    <Section className={styles.section} data-motion-portfolio id="portfolio">
      <Container className={styles.content}>
        <div className={styles.header} data-motion-reveal>
          <div>
            <Text as="p" className={styles.eyebrow} size="caption" tone="muted">
              Selected work · development imagery
            </Text>
            <Heading as="h2">A continuous photography journey.</Heading>
          </div>
          <Text as="p" className={styles.intro} tone="muted">
            Twenty data-driven frames preserve their natural proportions and can
            be replaced with final photography without changing the grid.
          </Text>
        </div>

        <div className={styles.grid}>
          {activeItems.map((item, index) => (
            <figure
              className={styles.item}
              data-motion-reveal
              key={item.id}
              style={{ "--portfolio-ratio": `${item.width} / ${item.height}` }}
            >
              <Image
                alt={item.altText}
                className={styles.image}
                fill
                loading="lazy"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                src={item.mediaUrl}
              />
              <figcaption className={styles.caption}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
