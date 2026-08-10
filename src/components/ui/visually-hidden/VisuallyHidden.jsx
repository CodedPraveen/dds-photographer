import { cn } from "@/lib/ui/cn";

import styles from "./VisuallyHidden.module.css";

export function VisuallyHidden({
  as: Component = "span",
  className,
  ...props
}) {
  return <Component className={cn(styles.root, className)} {...props} />;
}
