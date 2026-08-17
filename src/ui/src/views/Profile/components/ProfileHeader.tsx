import Badge from "react-bootstrap/Badge";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router";

import type { ClassificationNode, Profile } from "#/api/types";
import { RichText } from "#/components/RichText";

import styles from "./ProfileHeader.module.css";

export function ProfileHeader({
  profile,
  classification,
  otherNames,
  slug,
}: {
  profile: Profile;
  classification: ClassificationNode[];
  otherNames: string[];
  slug: string;
}) {
  const intl = useIntl();
  const bieUrl = profile.guid
    ? `${import.meta.env.VITE_ALA_BIE_SPECIES}${profile.guid}`
    : null;
  const archived = Boolean(profile.archivedDate);
  const isStub = profile.profileStatus === "Empty";
  const isDraft = Boolean(profile.privateMode);

  return (
    <header className={styles.header}>
      {classification.length > 0 && (
        <nav
          className={styles.taxonomyBreadcrumb}
          aria-label={intl.formatMessage({
            id: "view.profile.taxonomy.breadcrumb.ariaLabel",
          })}
        >
          {classification.map((node, index) => (
            <span key={`${node.guid}`} className={styles.crumb}>
              {index > 0 && (
                <span className={styles.crumbSeparator} aria-hidden="true">
                  &gt;
                </span>
              )}
              {node.profileId || node.profileName ? (
                <Link
                  to={`/opus/${slug}/profile/${encodeURIComponent(
                    node.profileName || node.profileId || node.name,
                  )}`}
                  className={styles.crumbLink}
                >
                  {node.name}
                </Link>
              ) : (
                <span>{node.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className={styles.titleRow}>
        <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
          {profile.rank && (
            <div>
              <Badge bg="light" text="dark">
                {profile.rank}
              </Badge>
            </div>
          )}
          <h1 className={styles.title}>
            <em>{profile.scientificName}</em>
            {profile.nameAuthor ? (
              <RichText
                as="span"
                className={styles.author}
                html={profile.nameAuthor}
              />
            ) : null}
          </h1>
        </div>
        <div className={styles.externalLinks}>
          {bieUrl && (
            <a href={bieUrl} target="_blank" rel="noreferrer">
              <FormattedMessage id="view.profile.link.ala" />
            </a>
          )}
          {profile.nslUrl && (
            <a href={profile.nslUrl} target="_blank" rel="noreferrer">
              <FormattedMessage id="view.profile.link.nsl" />
            </a>
          )}
        </div>
      </div>

      {otherNames.length > 0 && (
        <p className={styles.otherNames}>{otherNames.join(", ")}</p>
      )}

      {profile.nslProtologue && (
        <div className={styles.citation}>
          <RichText html={profile.nslProtologue} />
        </div>
      )}

      <div className={styles.statusBadges}>
        {archived && (
          <Badge bg="warning" text="dark">
            <FormattedMessage id="view.profile.status.archived" />
          </Badge>
        )}
        {isStub && (
          <Badge bg="secondary">
            <FormattedMessage id="view.profile.status.stub" />
          </Badge>
        )}
        {isDraft && (
          <Badge bg="info">
            <FormattedMessage id="view.profile.status.draft" />
          </Badge>
        )}
      </div>
    </header>
  );
}
