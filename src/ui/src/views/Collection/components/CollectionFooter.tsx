import {
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import type { Collection } from "#/api/types";
import { RichText } from "#/components/RichText";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";

import styles from "./CollectionFooter.module.css";

type CollectionFooterProps = {
  collection: Collection;
};

export function CollectionFooter({ collection }: CollectionFooterProps) {
  const logos = collection.brandingConfig.logos?.filter((logo) => logo.logoUrl);
  const contact = collection.contact;
  const issn = collection.brandingConfig.issn;
  const shortLicense = collection.brandingConfig.shortLicense;
  const footerText = collection.footerText;

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.border} />
        <Row className="gy-4">
          <Col md={8}>
            <Row className="g-3 align-items-center">
              {(logos && logos.length > 0
                ? logos
                : [{ logoUrl: "/favicon.svg", hyperlink: undefined }]
              ).map((logo) => {
                const src = resolveMediaUrl(logo.logoUrl) ?? logo.logoUrl;
                const image = (
                  <img
                    key={logo.logoUrl}
                    src={src}
                    alt=""
                    className={styles.logo}
                  />
                );
                return logo.hyperlink ? (
                  <Col xs={12} sm={6} md={4} key={logo.logoUrl}>
                    <a
                      href={logo.hyperlink}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.logoLink}
                    >
                      {image}
                    </a>
                  </Col>
                ) : (
                  <Col xs={12} sm={6} md={4} key={logo.logoUrl}>
                    {image}
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col md={4} className={styles.metaColumn}>
            <Row className="gy-3">
              <Col xs={12} md={7}>
                {footerText?.trim() && (
                  <div className={styles.footerText}>
                    <RichText html={footerText} />
                  </div>
                )}
                {contact?.email?.includes("@") ? (
                  <a
                    className={styles.contactLink}
                    href={`mailto:${contact.email}`}
                    title="Email this collection"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{contact.email}</span>
                  </a>
                ) : contact?.email ? (
                  <a
                    className={styles.contactLink}
                    href={contact.email}
                    target="_blank"
                    rel="noreferrer"
                    title="Contact the Atlas"
                  >
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>
                      <FormattedMessage id="view.collectionFooter.contactAtlas" />
                    </span>
                  </a>
                ) : null}
                {(contact?.facebook || contact?.twitter) && (
                  <ul className={styles.social}>
                    {contact.facebook && (
                      <li>
                        <a
                          href={contact.facebook}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Facebook"
                        >
                          <FontAwesomeIcon icon={faFacebook} />
                        </a>
                      </li>
                    )}
                    {contact.twitter && (
                      <li>
                        <a
                          href={contact.twitter}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Twitter"
                        >
                          <FontAwesomeIcon icon={faTwitter} />
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </Col>
              <Col xs={12} md={5}>
                {issn && (
                  <p className={styles.meta}>
                    <FormattedMessage
                      id="view.collectionFooter.issn"
                      values={{ issn }}
                    />
                  </p>
                )}
                {shortLicense?.trim() && (
                  <RichText html={shortLicense} className={styles.meta} />
                )}
                <p className={`${styles.meta} mb-0`}>
                  <Link to="/">
                    <FormattedMessage id="view.collectionFooter.otherCollections" />
                  </Link>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
