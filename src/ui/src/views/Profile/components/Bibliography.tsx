import { FormattedMessage } from "react-intl";

import type { BibliographyEntry } from "#/api/types";
import styles from "./Bibliography.module.css";
import { Section } from "./Section";

export function Bibliography({ entries }: { entries: BibliographyEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <Section
      id="bibliography"
      title={<FormattedMessage id="view.profile.section.bibliography" />}
    >
      <ol className={styles.bibliography}>
        {entries.map((entry, index) => (
          <li key={`${entry.order ?? index}-${entry.text?.slice(0, 24)}`}>
            {entry.text}
          </li>
        ))}
      </ol>
    </Section>
  );
}
