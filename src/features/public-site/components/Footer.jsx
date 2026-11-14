import { Container } from "@/components/ui/container/Container";
import { Link } from "@/components/ui/link/Link";
import { Text } from "@/components/ui/typography/Text";

import styles from "./Footer.module.css";

export function Footer({ contact, navigation, services, socialLinks }) {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.main}>
          <div className={styles.brandBlock}>
            <p className={styles.brand}>DDS Photographer</p>
            <Text
              as="p"
              className={styles.brandCopy}
              size="small"
              tone="inverse"
            >
              Temporary public-site content. Final studio details will replace
              this preview.
            </Text>
          </div>

          <FooterColumn title="Navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href} tone="inverse">
                {item.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Services">
            {services.map((service) => (
              <Text as="span" key={service.title} size="small" tone="inverse">
                {service.title}
              </Text>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            <Link href={contact.email.href} tone="inverse">
              {contact.email.label}
            </Link>
            <Link href={contact.phone.href} tone="inverse">
              {contact.phone.label}
            </Link>
            <Text as="span" size="small" tone="inverse">
              {contact.location}
            </Text>
          </FooterColumn>

          <FooterColumn title="Follow">
            {socialLinks.map((link) => (
              <Link
                href={link.href}
                key={link.label}
                target="_blank"
                tone="inverse"
              >
                {link.label}
                <span className={styles.temporaryLabel}> (placeholder)</span>
              </Link>
            ))}
          </FooterColumn>
        </div>

        <div className={styles.bottom}>
          <Text as="p" size="caption" tone="inverse">
            © 2026 DDS Photographer. Temporary business details.
          </Text>
          <Link href="/#home" tone="inverse">
            Back to top ↑
          </Link>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ children, title }) {
  return (
    <div className={styles.column}>
      <Text as="p" className={styles.columnTitle} size="caption" tone="inverse">
        {title}
      </Text>
      <div className={styles.columnLinks}>{children}</div>
    </div>
  );
}
