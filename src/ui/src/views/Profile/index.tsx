import { type ReactNode, useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useOutletContext, useParams } from "react-router";

import api from "#/api";
import { ApiError } from "#/api/query";
import type {
  BhlLink,
  BibliographyEntry,
  ClassificationNode,
  Profile,
  ProfileAttribute,
  ProfileImage,
  ProfileLink,
} from "#/api/types";
import PageLoader from "#/components/PageLoader";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";

import type { CollectionOutletContext } from "../Collection";
import styles from "./index.module.css";

function RichText({ html }: { html?: string | null }) {
  if (!html?.trim()) return null;

  return (
    <div
      className={styles.richText}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Section({
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

function formatProfileName(profile: Profile): string {
  const formatted = profile.profileSettings?.formattedNameText?.trim();
  if (formatted) return formatted;

  const name = profile.scientificName?.trim() || profile.fullName?.trim() || "";
  const author = profile.nameAuthor?.trim();
  return author ? `${name} ${author}` : name;
}

function otherNamesFromAttributes(
  attributes: ProfileAttribute[] = [],
): string[] {
  return attributes
    .filter((attribute) => attribute.containsName)
    .map((attribute) => attribute.plainText?.trim() || attribute.title?.trim())
    .filter((value): value is string => Boolean(value));
}

function sortByOrder<T extends { order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function formatDate(value?: string | number | null): string | null {
  if (value == null || value === "") return null;
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

export function Component() {
  const intl = useIntl();
  const { slug, nameOrId } = useParams<{ slug: string; nameOrId: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [primaryImage, setPrimaryImage] = useState<ProfileImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"notFound" | "generic" | null>(null);

  useEffect(() => {
    if (!slug || !nameOrId) return;

    const opusId = slug;
    const profileId = nameOrId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setProfile(null);
      setPrimaryImage(null);

      try {
        const data = await api.profile.get(opusId, profileId, {
          fullClassification: true,
        });
        if (cancelled) return;

        setProfile(data.profile);

        if (data.profile.guid && !data.profile.archivedDate) {
          try {
            const images = await api.profile.images(opusId, data.profile.uuid, {
              searchIdentifier: `lsid:${data.profile.guid}`,
              pageSize: 1,
              startIndex: 0,
            });
            if (!cancelled) {
              setPrimaryImage(
                images.primaryImage ?? images.images?.[0] ?? null,
              );
            }
          } catch {
            if (!cancelled) setPrimaryImage(null);
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 400)
        ) {
          setError("notFound");
        } else {
          setError("generic");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, nameOrId]);

  const otherNames = useMemo(
    () => otherNamesFromAttributes(profile?.attributes),
    [profile?.attributes],
  );

  const attributes = useMemo(
    () =>
      sortByOrder(profile?.attributes ?? []).filter(
        (attribute) => !attribute.containsName,
      ),
    [profile?.attributes],
  );

  const bibliography = useMemo(
    () => sortByOrder(profile?.bibliography ?? []),
    [profile?.bibliography],
  );

  const classification = profile?.classification ?? [];
  const links = profile?.links ?? [];
  const bhl = profile?.bhl ?? [];
  const authorship = profile?.authorship ?? [];

  const documentTitle = profile
    ? intl.formatMessage(
        { id: "app.documentTitle" },
        { title: formatProfileName(profile) },
      )
    : intl.formatMessage(
        { id: "app.documentTitle" },
        { title: collection.title },
      );

  if (loading) {
    return (
      <div className="py-5">
        <title>{documentTitle}</title>
        <PageLoader />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="vstack gap-3">
        <title>{documentTitle}</title>
        <Alert variant="danger" className="mb-0">
          <FormattedMessage
            id={
              error === "notFound"
                ? "view.profile.error.notFound"
                : "view.profile.error.loadFailed"
            }
          />
        </Alert>
        <Link
          to={`/opus/${slug}`}
          className="btn btn-outline-primary align-self-start"
        >
          <FormattedMessage id="view.profile.action.backToCollection" />
        </Link>
      </div>
    );
  }

  const title = formatProfileName(profile);
  const mapSnapshotUrl = resolveMediaUrl(profile.mapSnapshot);
  const imageUrl = resolveMediaUrl(
    primaryImage?.largeImageUrl || primaryImage?.thumbnailUrl,
  );
  const bieUrl = profile.guid
    ? `${import.meta.env.VITE_ALA_BIE_SPECIES}${profile.guid}`
    : null;
  const archived = Boolean(profile.archivedDate);
  const isStub = profile.profileStatus === "Empty";
  const isDraft = Boolean(profile.privateMode);

  return (
    <article className="vstack gap-4">
      <title>{documentTitle}</title>

      <header className={styles.header}>
        {classification.length > 0 && (
          <nav
            className={styles.taxonomyBreadcrumb}
            aria-label={intl.formatMessage({
              id: "view.profile.taxonomy.breadcrumb.ariaLabel",
            })}
          >
            {classification.map((node, index) => (
              <span
                key={`${node.rank}-${node.name}-${index}`}
                className={styles.crumb}
              >
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
          <h1 className={styles.title}>
            <em>{profile.scientificName}</em>
            {profile.nameAuthor ? (
              <span className={styles.author}> {profile.nameAuthor}</span>
            ) : null}
          </h1>
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
          {profile.rank && (
            <Badge bg="light" text="dark">
              {profile.rank}
            </Badge>
          )}
        </div>
      </header>

      {archived && profile.archiveComment && (
        <Alert variant="warning" className="mb-0">
          {profile.archiveComment}
        </Alert>
      )}

      {!archived && (mapSnapshotUrl || imageUrl) && (
        <Row className="g-4">
          {mapSnapshotUrl && (
            <Col xs={12} md={6}>
              <figure className={styles.mediaCard}>
                <img
                  src={mapSnapshotUrl}
                  alt={intl.formatMessage({ id: "view.profile.map.alt" })}
                  className={styles.mediaImage}
                />
                <figcaption className={styles.mediaCaption}>
                  <FormattedMessage id="view.profile.map.caption" />
                </figcaption>
              </figure>
            </Col>
          )}
          {imageUrl && (
            <Col xs={12} md={6}>
              <figure className={styles.mediaCard}>
                <img src={imageUrl} alt={title} className={styles.mediaImage} />
                {(primaryImage?.caption ||
                  primaryImage?.dataResourceName ||
                  primaryImage?.metadata?.creator) && (
                  <figcaption className={styles.mediaCaption}>
                    {primaryImage.caption && (
                      <RichText html={primaryImage.caption} />
                    )}
                    {primaryImage.dataResourceName && (
                      <div>{primaryImage.dataResourceName}</div>
                    )}
                    {primaryImage.metadata?.creator && (
                      <div>
                        <FormattedMessage
                          id="view.profile.image.by"
                          values={{ creator: primaryImage.metadata.creator }}
                        />
                      </div>
                    )}
                  </figcaption>
                )}
              </figure>
            </Col>
          )}
        </Row>
      )}

      {attributes.length > 0 && (
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
      )}

      {classification.length > 0 && !archived && (
        <Section
          id="taxonomy"
          title={<FormattedMessage id="view.profile.section.taxonomy" />}
        >
          <ClassificationList nodes={classification} slug={slug!} />
        </Section>
      )}

      {links.length > 0 && (
        <Section
          id="links"
          title={<FormattedMessage id="view.profile.section.links" />}
        >
          <LinkList links={links} />
        </Section>
      )}

      {bhl.length > 0 && (
        <Section
          id="bhl"
          title={<FormattedMessage id="view.profile.section.bhl" />}
        >
          <BhlList items={bhl} />
        </Section>
      )}

      {bibliography.length > 0 && (
        <Section
          id="bibliography"
          title={<FormattedMessage id="view.profile.section.bibliography" />}
        >
          <ol className={styles.bibliography}>
            {bibliography.map((entry: BibliographyEntry, index) => (
              <li key={`${entry.order ?? index}-${entry.text?.slice(0, 24)}`}>
                {entry.text}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <footer className={styles.footer}>
        {authorship.length > 0 && (
          <ul className={styles.authorship}>
            {authorship.map((item, index) => (
              <li key={`${item.category}-${index}`}>
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

        {collection.copyrightText && (
          <p className={styles.footerMeta}>&copy; {collection.copyrightText}</p>
        )}
      </footer>
    </article>
  );
}

function ClassificationList({
  nodes,
  slug,
}: {
  nodes: ClassificationNode[];
  slug: string;
}) {
  return (
    <ul className={styles.classification}>
      {nodes.map((node, index) => (
        <li key={`${node.rank}-${node.name}-${index}`}>
          {node.rank && <span className={styles.rank}>{node.rank}</span>}
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
  );
}

function LinkList({ links }: { links: ProfileLink[] }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link, index) => (
        <li key={link.uuid || `${link.url}-${index}`}>
          {link.url ? (
            <a href={link.url} target="_blank" rel="noreferrer">
              {link.title || link.url}
            </a>
          ) : (
            <span>{link.title}</span>
          )}
          {link.description && (
            <p className={styles.linkDescription}>{link.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function BhlList({ items }: { items: BhlLink[] }) {
  return (
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
                  {item.title || item.fullTitle || item.url}
                </a>
              ) : (
                <span>{item.title || item.fullTitle}</span>
              )}
              {item.description && (
                <p className={styles.linkDescription}>{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
