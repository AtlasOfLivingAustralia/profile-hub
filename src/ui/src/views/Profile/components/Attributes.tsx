import { FormattedMessage } from "react-intl";

import type { ProfileAttribute } from "#/api/types";
import { RichText } from "#/components/RichText";

import styles from "./Attributes.module.css";
import { Section } from "./Section";

export function Attributes({ attributes }: { attributes: ProfileAttribute[] }) {
  if (attributes.length === 0) return null;

  return (
    <Section
      id="attributes"
      title={<FormattedMessage id="view.profile.section.attributes" />}
    >
      <dl className={styles.attributeList}>
        {attributes.map((attribute) => (
          <div key={attribute.uuid} className={styles.attribute}>
            <dt>{attribute.title}</dt>
            <dd>
              {attribute.text?.trim() ? (
                <RichText html={attribute.text} />
              ) : (
                attribute.plainText
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
