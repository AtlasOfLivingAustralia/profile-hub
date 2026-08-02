import {
  faBinoculars,
  faBookOpen,
  faChevronRight,
  faFilter,
  faFingerprint,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Link, useOutletContext, useParams } from "react-router";

import type { CollectionOutletContext } from "../Collection";

import styles from "./index.module.css";
import { useMemo } from "react";

function RichText({ html }: { html?: string }) {
  if (!html) {
    return (
      <p className="text-body-secondary mb-0">No information available.</p>
    );
  }

  return (
    <div
      className={styles.richText}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Collection content is stored as rich HTML by the API
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Component() {
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();

  // Memoize actions
  const actions = useMemo(
    () => [
      {
        label: "Search",
        icon: faSearch,
        helpText: collection.opusLayoutConfig.helpTextSearch,
      },
      {
        label: "Browse",
        icon: faBinoculars,
        helpText: collection.opusLayoutConfig.helpTextBrowse,
        to: `/opus/${slug}/browse`,
      },
      ...(collection.keybaseProjectId
        ? [
            {
              label: "Identify",
              icon: faFingerprint,
              helpText: collection.opusLayoutConfig.helpTextIdentify,
            },
          ]
        : []),
      {
        label: "Filter",
        icon: faFilter,
        helpText: collection.opusLayoutConfig.helpTextFilter,
        to: `/opus/${slug}/filter`,
      },
      {
        label: "Library",
        icon: faBookOpen,
        helpText: collection.opusLayoutConfig.helpTextDocuments,
      },
    ],
    [collection, slug],
  );

  return (
    <Row className="g-4">
      <Col md={12} lg="auto">
        <div className={styles.panel}>
          <h2 className={styles.heading}>Explore this collection</h2>
          <div className="vstack gap-3">
            {actions.map(({ label, icon, helpText, to }) => {
              const content = (
                <>
                  <span className={styles.actionIcon}>
                    <FontAwesomeIcon icon={icon} />
                  </span>
                  <span>{label}</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={styles.actionArrow}
                  />
                </>
              );

              return to ? (
                <Link
                  key={label}
                  to={to}
                  className={styles.actionButton}
                  title={helpText}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  className={styles.actionButton}
                  title={helpText}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </Col>
      <Col md={12} lg={8}>
        <section className="px-2 px-md-4 pt-3">
          <h2 className="mb-4 text-body-secondary">About</h2>
          <RichText html={collection.aboutHtml} />
          <h2 className="mb-4 mt-5 text-body-secondary">
            Collection information
          </h2>
          <RichText html={collection.opusLayoutConfig.explanatoryText} />
        </section>
      </Col>
    </Row>
  );
}
