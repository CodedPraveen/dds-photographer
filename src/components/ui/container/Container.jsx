import { cn } from "@/lib/ui/cn";

import styles from "./Container.module.css";

export function Container({ as: Component = "div", className, ...props }) {
  return <Component className={cn(styles.container, className)} {...props} />;
}
