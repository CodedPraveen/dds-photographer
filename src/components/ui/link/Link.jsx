import NextLink from "next/link";

import { cn } from "@/lib/ui/cn";
import { isExternalUrl } from "@/lib/url/is-external-url";

import styles from "./Link.module.css";

const toneClasses = {
  default: styles.default,
  muted: styles.muted,
  inverse: styles.inverse,
};

export function Link({
  className,
  href,
  rel,
  target,
  tone = "default",
  ...props
}) {
  const classNames = cn(
    styles.link,
    toneClasses[tone] ?? styles.default,
    className,
  );
  const safeRel =
    target === "_blank"
      ? [rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
      : rel;

  if (isExternalUrl(href)) {
    return (
      <a
        className={classNames}
        href={href}
        rel={safeRel}
        target={target}
        {...props}
      />
    );
  }

  return (
    <NextLink
      className={classNames}
      href={href}
      rel={safeRel}
      target={target}
      {...props}
    />
  );
}
