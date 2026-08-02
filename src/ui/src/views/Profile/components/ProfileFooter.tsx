import { FormattedMessage } from "react-intl";

import type { Authorship, Profile } from "#/api/types";

import { formatDate } from "../helpers";
import styles from "./ProfileFooter.module.css";

export function ProfileFooter({
  profile,
  authorship,
  copyrightText,
}: {
  profile: Profile;
  authorship: Authorship[];
  copyrightText?: string | null;
}) {
  return (
    <footer className={styles.footer}>
      {authorship.length > 0 && (
        <ul className={styles.authorship}>
          {authorship.map((item) => (
            <li key={`${item.category}-${item.text}`}>
              {item.category ? (
                <>
                  <strong>{item.category}:</strong> {item.text}
                </>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ul>
      )}

      {profile.citationText && (
        <p className={styles.footerMeta}>{profile.citationText}</p>
      )}

      {(profile.lastPublished || profile.lastUpdated) && (
        <p className={styles.footerMeta}>
          <FormattedMessage
            id="view.profile.footer.lastUpdated"
            values={{
              date:
                formatDate(profile.lastPublished) ||
                formatDate(profile.lastUpdated),
            }}
          />
        </p>
      )}

      {copyrightText && (
        <p className={styles.footerMeta}>&copy; {copyrightText}</p>
      )}
    </footer>
  );
}
