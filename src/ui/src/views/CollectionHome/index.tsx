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
        to: `/opus/${slug}/search`,
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
              to: `/opus/${slug}/identify`,
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

  const updatesHtml = collection.opusLayoutConfig.updatesSection?.trim();
  const explanatoryHtml = collection.opusLayoutConfig.explanatoryText?.trim();

  return (
    <Row className="g-4">
      <Col sm={12} md={4}>
        <div className={styles.panel}>
          <h2 className={styles.heading}>
            <FormattedMessage id="view.collectionHome.exploreHeading" />
          </h2>
          <div className="vstack gap-3">
            {actions.map(({ messageId, icon, helpText, to }) => (
              <Link
                key={messageId}
                to={to}
                className={styles.actionButton}
                title={helpText}
              >
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
              </Link>
            ))}
          </div>
        </div>
      </Col>
      <Col sm={12} md={4}>
        <section className="px-1 px-md-2 pt-1">
          {explanatoryHtml ? (
            <RichText html={explanatoryHtml} />
          ) : (
            <p className="text-body-secondary mb-0">
              <FormattedMessage id="view.collectionHome.noInformation" />
            </p>
          )}
        </section>
      </Col>
      <Col sm={12} md={4}>
        {updatesHtml ? (
          <section className="px-1 px-md-2 pt-1">
            <h2 className="h5 mb-3 text-body-secondary">
              <FormattedMessage id="view.collectionHome.updatesHeading" />
            </h2>
            <RichText html={updatesHtml} />
          </section>
        ) : null}
      </Col>
    </Row>
  );
}
