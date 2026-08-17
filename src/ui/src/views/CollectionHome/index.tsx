import {
  faBinoculars,
  faBookOpen,
  faChevronRight,
  faFilter,
  faFingerprint,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FormattedMessage } from "react-intl";
import { Link, useOutletContext, useParams } from "react-router";

import { RichText } from "#/components/RichText";

import type { CollectionOutletContext } from "../Collection";

import styles from "./index.module.css";

export function Component() {
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();

  const actions = useMemo(
    () => [
      {
        messageId: "view.collectionHome.action.search",
        icon: faSearch,
        helpText: collection.opusLayoutConfig.helpTextSearch,
      },
      {
        messageId: "view.collectionHome.action.browse",
        icon: faBinoculars,
        helpText: collection.opusLayoutConfig.helpTextBrowse,
        to: `/opus/${slug}/browse`,
      },
      ...(collection.keybaseProjectId
        ? [
            {
              messageId: "view.collectionHome.action.identify",
              icon: faFingerprint,
              helpText: collection.opusLayoutConfig.helpTextIdentify,
            },
          ]
        : []),
      {
        messageId: "view.collectionHome.action.filter",
        icon: faFilter,
        helpText: collection.opusLayoutConfig.helpTextFilter,
        to: `/opus/${slug}/filter`,
      },
      {
        messageId: "view.collectionHome.action.library",
        icon: faBookOpen,
        helpText: collection.opusLayoutConfig.helpTextDocuments,
        to: `/opus/${slug}/documents`,
      },
    ],
    [collection, slug],
  );

  return (
    <Row className="g-4">
      <Col md={12} lg={3}>
        <div className={styles.panel}>
          <h2 className={styles.heading}>
            <FormattedMessage id="view.collectionHome.exploreHeading" />
          </h2>
          <div className="vstack gap-3">
            {actions.map(({ messageId, icon, helpText, to }) => {
              const content = (
                <>
                  <span className={styles.actionIcon}>
                    <FontAwesomeIcon icon={icon} />
                  </span>
                  <span>
                    <FormattedMessage id={messageId} />
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={styles.actionArrow}
                  />
                </>
              );

              return to ? (
                <Link
                  key={messageId}
                  to={to}
                  className={styles.actionButton}
                  title={helpText}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={messageId}
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
      <Col md={12} lg={9}>
        <section className="px-2 px-md-4 pt-3">
          <h2 className="mb-4 text-body-secondary">
            <FormattedMessage id="view.collectionHome.aboutHeading" />
          </h2>
          {collection.aboutHtml?.trim() ? (
            <RichText html={collection.aboutHtml} />
          ) : (
            <p className="text-body-secondary mb-0">
              <FormattedMessage id="view.collectionHome.noInformation" />
            </p>
          )}
          <h2 className="mb-4 mt-5 text-body-secondary">
            <FormattedMessage id="view.collectionHome.informationHeading" />
          </h2>
          {collection.opusLayoutConfig.explanatoryText?.trim() ? (
            <RichText html={collection.opusLayoutConfig.explanatoryText} />
          ) : (
            <p className="text-body-secondary mb-0">
              <FormattedMessage id="view.collectionHome.noInformation" />
            </p>
          )}
        </section>
      </Col>
    </Row>
  );
}
