import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

import styles from "./PageMessage.module.css";

interface PageMessageProps {
  icon: IconDefinition;
  children: ReactNode;
  className?: string;
}

export default function PageMessage({
  icon,
  children,
  className,
}: PageMessageProps) {
  return (
    <div
      className={`${styles.message}${className ? ` ${className}` : ""}`}
      role="status"
    >
      <div className={styles.icon} aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </div>
      <p className={styles.text}>{children}</p>
    </div>
  );
}
