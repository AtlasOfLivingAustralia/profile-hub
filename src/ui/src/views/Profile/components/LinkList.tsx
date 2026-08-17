import { FormattedMessage } from "react-intl";

import type { ProfileLink } from "#/api/types";
import { RichText } from "#/components/RichText";

import styles from "./LinkList.module.css";
import { Section } from "./Section";

export function LinkList({ links }: { links: ProfileLink[] }) {
  if (links.length === 0) return null;

  return (
    <Section
      id="links"
      title={<FormattedMessage id="view.profile.section.links" />}
    >
      <ul className={styles.linkList}>
        {links.map((link, index) => (
          <li key={link.uuid || `${link.url}-${index}`}>
            {link.url ? (
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.title ? (
                  <RichText as="span" html={link.title} />
                ) : (
                  link.url
                )}
              </a>
            ) : (
              <RichText as="span" html={link.title} />
            )}
            {link.description && (
              <p className={styles.linkDescription}>
                <RichText as="span" html={link.description} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
