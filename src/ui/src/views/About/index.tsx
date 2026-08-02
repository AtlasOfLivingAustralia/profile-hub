import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext, useParams } from "react-router";

import api from "#/api";
import type {
  CollectionStatistic,
  OpusAboutAdministrator,
  OpusAboutResponse,
} from "#/api/types";
import PageLoader from "#/components/PageLoader";

import type { CollectionOutletContext } from "../Collection";
import styles from "./index.module.css";

function RichText({ html }: { html?: string | null }) {
  if (!html?.trim()) return null;

  return (
    <div
      className={styles.richText}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: About content is stored as rich HTML by the API
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      className={styles.section}
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <h2 id={id ? `${id}-title` : undefined} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Component() {
  const intl = useIntl();
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const [about, setAbout] = useState<OpusAboutResponse | null>(null);
  const [statistics, setStatistics] = useState<CollectionStatistic[] | null>(
    null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const opusSlug = slug;
    let cancelled = false;

    async function load() {
      setError(false);
      try {
        const [aboutData, statsData] = await Promise.all([
          api.opus.about(opusSlug),
          api.opus.statistics(opusSlug),
        ]);
        if (cancelled) return;
        setAbout(aboutData);
        setStatistics(statsData);
      } catch (_) {
        if (!cancelled) {
          setAbout(null);
          setStatistics(null);
          setError(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const documentTitle = intl.formatMessage(
    { id: "view.about.documentTitle" },
    { name: about?.opus.title || collection.title },
  );

  if (!about || !statistics) {
    return (
      <div className="vstack gap-4">
        <title>{documentTitle}</title>
        {error ? (
          <div className="alert alert-danger mb-0" role="alert">
            <FormattedMessage id="view.about.error.loadFailed" />
          </div>
        ) : (
          <div className="py-5">
            <PageLoader />
          </div>
        )}
      </div>
    );
  }

  const opus = about.opus;
  const citationHtml = opus.citationHtml?.trim();
  const hasCitation = Boolean(citationHtml);
  const administrators = (about.administrators ?? []).filter(
    (admin): admin is OpusAboutAdministrator => Boolean(admin?.name),
  );
  const citationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/opus/${slug}`
      : opus.opusUrl;

  return (
    <article className="vstack gap-4">
      <title>{documentTitle}</title>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <FormattedMessage
            id="view.about.title"
            values={{ name: opus.title || collection.title }}
          />
        </h1>
      </header>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          <FormattedMessage id="view.about.error.loadFailed" />
        </div>
      )}

      <section className={styles.panel}>
        {opus.aboutHtml?.trim() ? (
          <RichText html={opus.aboutHtml} />
        ) : (
          <p className="text-body-secondary mb-0">
            <FormattedMessage id="view.about.empty" />
          </p>
        )}
      </section>

      {hasCitation && (
        <Section title={<FormattedMessage id="view.about.section.citations" />}>
          <div className={styles.panel}>
            <p className={styles.lead}>
              <FormattedMessage id="view.about.citation.collectionIntro" />
            </p>
            <blockquote className={styles.citation}>
              <RichText html={citationHtml} />
            </blockquote>

            <p className={styles.lead}>
              <FormattedMessage id="view.about.citation.profileIntro" />
            </p>
            <blockquote className={styles.citation}>
              <p className="mb-0">
                <FormattedMessage
                  id="view.about.citation.example"
                  values={{
                    year: opus.year,
                    date: opus.date,
                    citation: (
                      <span
                        className={styles.inlineHtml}
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: Citation HTML comes from the collection about API
                        dangerouslySetInnerHTML={{
                          __html: citationHtml || "",
                        }}
                      />
                    ),
                    url: citationUrl ? (
                      <a href={citationUrl} rel="noreferrer">
                        {citationUrl}
                      </a>
                    ) : null,
                  }}
                />
              </p>
            </blockquote>
          </div>
        </Section>
      )}

      {administrators.length > 0 && (
        <Section
          title={<FormattedMessage id="view.about.section.administration" />}
        >
          <div className={styles.panel}>
            <p className={styles.lead}>
              <FormattedMessage id="view.about.administration.intro" />
            </p>
            <ul className={styles.adminList}>
              {administrators.map((admin) => (
                <li key={`${admin.name}-${admin.email ?? "no-email"}`}>
                  {admin.email ? (
                    <a href={`mailto:${admin.email}`}>{admin.name}</a>
                  ) : (
                    admin.name
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {statistics.length > 0 && (
        <Section
          title={<FormattedMessage id="view.about.section.statistics" />}
        >
          <Row className="g-3">
            {statistics.map((stat) => (
              <Col key={stat.id} xs={12} sm={6} lg={4}>
                <div className={styles.statCard} title={stat.tooltip}>
                  <div className={styles.statLabel}>
                    <span>{stat.name}</span>
                    {stat.caveat && (
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.statInfo}
                        title={stat.caveat}
                      />
                    )}
                  </div>
                  <div className={styles.statValue}>{stat.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Section>
      )}

      <Section
        title={<FormattedMessage id="view.about.section.copyright" />}
        id="copyright"
      >
        <div className={styles.panel}>
          {opus.copyrightText && (
            <p className={styles.copyrightOwner}>&copy; {opus.copyrightText}</p>
          )}
          <RichText html={opus.genericCopyrightHtml} />
        </div>
      </Section>
    </article>
  );
}
