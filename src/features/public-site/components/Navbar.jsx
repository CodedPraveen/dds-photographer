"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/ui/container/Container";
import { Link } from "@/components/ui/link/Link";
import { VisuallyHidden } from "@/components/ui/visually-hidden/VisuallyHidden";
import { cn } from "@/lib/ui/cn";

import styles from "./Navbar.module.css";

export function Navbar({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 48);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={cn(styles.header, isScrolled && styles.scrolled)}>
      <Container className={styles.container}>
        <Link className={styles.brand} href="/#home" tone="inverse">
          DDS
          <VisuallyHidden> Photographer home</VisuallyHidden>
        </Link>

        <nav aria-label="Primary navigation" className={styles.desktopNav}>
          {items.map((item) => (
            <Link
              className={styles.navLink}
              href={item.href}
              key={item.href}
              tone="inverse"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className={styles.menuButton}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true">{isOpen ? "Close" : "Menu"}</span>
        </button>
      </Container>

      {isOpen ? (
        <nav
          aria-label="Mobile navigation"
          className={styles.mobileNav}
          id="mobile-navigation"
        >
          <Container className={styles.mobileNavInner}>
            {items.map((item) => (
              <Link
                className={styles.mobileLink}
                href={item.href}
                key={item.href}
                onClick={closeMenu}
                tone="inverse"
              >
                {item.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
