import { cn } from "@/lib/ui/cn";

import styles from "./Section.module.css";

export function Section({ as: Component = "section", className, ...props }) {
  return <Component className={cn(styles.section, className)} {...props} />;
}
