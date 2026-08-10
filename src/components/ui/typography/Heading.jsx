import { cn } from "@/lib/ui/cn";

import styles from "./Typography.module.css";

const sizeClasses = {
  display: styles.display,
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
};

export function Heading({ as: Component = "h2", className, size, ...props }) {
  const resolvedSize = size ?? (sizeClasses[Component] ? Component : "h2");

  return (
    <Component
      className={cn(
        styles.heading,
        sizeClasses[resolvedSize] ?? styles.h2,
        className,
      )}
      {...props}
    />
  );
}
