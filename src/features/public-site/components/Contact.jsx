import { Container } from "@/components/ui/container/Container";
import { Link } from "@/components/ui/link/Link";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Contact.module.css";

export function Contact({ content, headingLevel = "h1" }) {
  return (
    <Section className={styles.section} id="contact">
      <Container className={styles.content}>
        <Text
          as="p"
          className={styles.eyebrow}
          data-motion-reveal
          size="caption"
          tone="inverse"
        >
          {content.eyebrow} · temporary details
        </Text>
        <div className={styles.layout}>
          <Heading
            as={headingLevel}
            className={styles.title}
            data-motion-reveal
          >
            {content.title}
          </Heading>
          <div className={styles.details} data-motion-reveal>
            <Text as="p" className={styles.description} tone="inverse">
              {content.description}
            </Text>
            <address className={styles.address}>
              <Link href={content.email.href} tone="inverse">
                {content.email.label}
              </Link>
              <Link href={content.phone.href} tone="inverse">
                {content.phone.label}
              </Link>
              <Text as="span" size="small" tone="inverse">
                {content.location}
              </Text>
            </address>
          </div>
        </div>
      </Container>
    </Section>
  );
}
