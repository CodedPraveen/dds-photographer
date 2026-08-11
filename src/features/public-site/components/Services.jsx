import { Container } from "@/components/ui/container/Container";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Services.module.css";

export function Services({ items }) {
  return (
    <Section className={styles.section} id="services">
      <Container className={styles.content}>
        <div className={styles.header} data-motion-reveal>
          <Text as="p" className={styles.eyebrow} size="caption" tone="muted">
            Services · temporary content
          </Text>
          <Heading as="h2">Photography shaped around the story.</Heading>
        </div>

        <ol className={styles.list}>
          {items.map((service, index) => (
            <li className={styles.item} data-motion-reveal key={service.title}>
              <Text
                as="span"
                className={styles.number}
                size="caption"
                tone="muted"
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Heading as="h3" className={styles.title}>
                {service.title}
              </Heading>
              <Text as="p" className={styles.description} tone="muted">
                {service.description}
              </Text>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
