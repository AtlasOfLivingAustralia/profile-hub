import type { ReactNode } from "react";

import styles from "./Section.module.css";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>
        {title}
      </h2>
      <div className={styles.panel}>{children}</div>
    </section>
  );
}
