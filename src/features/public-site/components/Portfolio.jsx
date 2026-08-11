import Image from "next/image";

import { Container } from "@/components/ui/container/Container";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { cn } from "@/lib/ui/cn";

import styles from "./Portfolio.module.css";

export function Portfolio({ items }) {
  const activeItems = items
    .filter((item) => item.isActive)
    .sort((first, second) => first.sortOrder - second.sortOrder);

  return (
    <Section className={styles.section} id="portfolio">
      <Container className={styles.content}>
        <div className={styles.header} data-motion-reveal>
          <div>
            <Text as="p" className={styles.eyebrow} size="caption" tone="muted">
              Selected work · temporary imagery
            </Text>
            <Heading as="h2">A curated photography wall.</Heading>
          </div>
          <Text as="p" className={styles.intro} tone="muted">
            Six local placeholders preserve the approved image ordering, aspect
            ratios, and responsive editorial rhythm until final work is
            supplied.
          </Text>
        </div>

        <div className={styles.grid}>
          {activeItems.map((item, index) => (
            <figure
              className={cn(styles.item, styles[item.layout])}
              data-motion-reveal
              key={item.id}
            >
              <Image
                alt={item.altText}
                className={styles.image}
                fill
                loading={index < 2 ? "eager" : "lazy"}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                src={item.mediaUrl}
              />
              <figcaption className={styles.caption}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title} · temporary</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
