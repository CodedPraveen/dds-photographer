import { cn } from "@/lib/ui/cn";

import styles from "./Button.module.css";

const variantClasses = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      className={cn(
        styles.button,
        variantClasses[variant] ?? styles.primary,
        className,
      )}
      type={type}
      {...props}
    />
  );
}
