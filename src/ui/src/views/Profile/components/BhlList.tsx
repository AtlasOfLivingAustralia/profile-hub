import { FormattedMessage } from "react-intl";

import type { BhlLink } from "#/api/types";
import { RichText } from "#/components/RichText";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";

import styles from "./BhlList.module.css";
import { Section } from "./Section";

export function BhlList({ items }: { items: BhlLink[] }) {
  if (items.length === 0) return null;

  return (
    <Section
      id="bhl"
      title={<FormattedMessage id="view.profile.section.bhl" />}
    >
      <ul className={styles.bhlList}>
        {items.map((item, index) => {
          const thumb = resolveMediaUrl(item.thumbnailUrl);
          return (
            <li
              key={item.uuid || `${item.url}-${index}`}
              className={styles.bhlItem}
            >
              {thumb && <img src={thumb} alt="" className={styles.bhlThumb} />}
              <div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title || item.fullTitle ? (
                      <RichText as="span" html={item.title || item.fullTitle} />
                    ) : (
                      item.url
                    )}
                  </a>
                ) : (
                  <RichText as="span" html={item.title || item.fullTitle} />
                )}
                {item.description && (
                  <p className={styles.linkDescription}>
                    <RichText as="span" html={item.description} />
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
