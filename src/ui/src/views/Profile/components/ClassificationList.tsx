import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import type { ClassificationNode } from "#/api/types";
import styles from "./ClassificationList.module.css";
import { Section } from "./Section";

export function ClassificationList({
  nodes,
  slug,
}: {
  nodes: ClassificationNode[];
  slug: string;
}) {
  if (nodes.length === 0) return null;

  return (
    <Section
      id="taxonomy"
      title={<FormattedMessage id="view.profile.section.taxonomy" />}
    >
      <ul className={styles.classification}>
        {nodes.map((node) => (
          <li key={node.guid}>
            {node.rank && (
              <span className={styles.rank}>
                <FormattedMessage id={`classification.${node.rank}`} defaultMessage={node.rank} />
              </span>
            )}
            {node.profileId || node.profileName ? (
              <Link
                to={`/opus/${slug}/profile/${encodeURIComponent(
                  node.profileName || node.profileId || node.name,
                )}`}
              >
                {node.name}
              </Link>
            ) : (
              <span>{node.name}</span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
