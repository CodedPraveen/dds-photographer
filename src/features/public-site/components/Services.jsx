"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Container } from "@/components/ui/container/Container";
import { Section } from "@/components/ui/section/Section";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { cn } from "@/lib/ui/cn";

import styles from "./Services.module.css";

const SERVICE_STATE_EVENT = "dds:service-state";

export function Services({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = items[activeIndex];

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(SERVICE_STATE_EVENT, {
        detail: { index: activeIndex },
      }),
    );
  }, [activeIndex]);

  const showNextService = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  return (
    <Section className={styles.section} data-motion-services id="services">
      <Container className={styles.content}>
        <div className={styles.header} data-motion-reveal>
          <Text as="p" className={styles.eyebrow} size="caption" tone="inverse">
            Services · temporary content
          </Text>
          <Heading as="h2" className={styles.heading}>
            Photography shaped around the story.
          </Heading>
        </div>

        <div className={styles.layout}>
          <ol aria-label="Photography services" className={styles.list}>
            {items.map((service, index) => {
              const isActive = index === activeIndex;
              return (
                <li className={styles.item} key={service.title}>
                  <button
                    aria-controls="active-service-visual"
                    aria-pressed={isActive}
                    className={cn(
                      styles.serviceButton,
                      isActive && styles.active,
                    )}
                    onClick={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onPointerEnter={() => setActiveIndex(index)}
                    type="button"
                  >
                    <span className={styles.number}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.serviceCopy}>
                      <span className={styles.title}>{service.title}</span>
                      <span className={styles.description}>
                        {service.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            aria-label={`Show the next service. Current service: ${activeService.title}`}
            className={styles.visual}
            id="active-service-visual"
            onClick={showNextService}
            type="button"
          >
            {items.map((service, index) => (
              <Image
                alt={index === activeIndex ? service.altText : ""}
                aria-hidden={index === activeIndex ? undefined : "true"}
                className={cn(
                  styles.visualImage,
                  index === activeIndex && styles.visualImageActive,
                )}
                fill
                key={service.title}
                sizes="(max-width: 767px) 100vw, 50vw"
                src={service.mediaUrl}
              />
            ))}
            <span aria-live="polite" className={styles.visualLabel}>
              <span>{activeService.title}</span>
              <span>Tap visual to continue</span>
            </span>
          </button>
        </div>
      </Container>
    </Section>
  );
}
