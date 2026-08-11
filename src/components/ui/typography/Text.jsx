import { cn } from "@/lib/ui/cn";

import styles from "./Typography.module.css";

const sizeClasses = {
  body: styles.body,
  small: styles.small,
  caption: styles.caption,
};

const toneClasses = {
  default: styles.default,
  muted: styles.muted,
  inverse: styles.inverse,
};

export function Text({
  as: Component = "p",
  className,
  size = "body",
  tone = "default",
  ...props
}) {
  return (
    <Component
      className={cn(
        styles.text,
        sizeClasses[size] ?? styles.body,
        toneClasses[tone] ?? styles.default,
        className,
      )}
      {...props}
    />
  );
}
