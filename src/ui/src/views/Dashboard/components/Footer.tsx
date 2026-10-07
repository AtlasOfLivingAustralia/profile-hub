import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router";

import styles from "./Footer.module.css";

const ALA_HOME = import.meta.env.VITE_ALA_HOME_PAGE.replace(/\/$/, "");

const EXPLORE_LINKS = [
  { id: "footer.link.home", to: "/" },
  { id: "footer.link.search", to: "/opus/search" },
] as const;

const ATLAS_LINKS = [
  { id: "footer.link.ala", href: `${ALA_HOME}/` },
  { id: "footer.link.contact", href: `${ALA_HOME}/contact-us/` },
  { id: "footer.link.terms", href: `${ALA_HOME}/terms-of-use/` },
  {
    id: "footer.link.privacy",
    href: `${ALA_HOME}/terms-of-use/privacy-policy/`,
  },
] as const;

const SOCIAL_LINKS: {
  id: string;
  href: string;
  icon: IconDefinition;
}[] = [
  {
    id: "footer.social.facebook",
    href: "https://www.facebook.com/atlasoflivingaustralia",
    icon: faFacebook,
  },
  {
    id: "footer.social.instagram",
    href: "https://www.instagram.com/atlaslivingaustralia/",
    icon: faInstagram,
  },
  {
    id: "footer.social.x",
    href: "https://x.com/atlaslivingaust",
    icon: faTwitter,
  },
  {
    id: "footer.social.youtube",
    href: "https://www.youtube.com/user/atlaslivingaust",
    icon: faYoutube,
  },
  {
    id: "footer.social.linkedin",
    href: "https://www.linkedin.com/company/atlas-of-living-australia",
    icon: faLinkedin,
  },
];

export function Footer() {
  const intl = useIntl();
  const year = String(new Date().getFullYear());

  return (
    <footer
      className={styles.footer}
      aria-label={intl.formatMessage({ id: "footer.ariaLabel" })}
    >
      <Container>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.brandTitle}>
              <FormattedMessage id="view.home.title" />
            </p>
            <p className={styles.lede}>
              <FormattedMessage id="footer.lede" />
            </p>
            <ul className={styles.social}>
              {SOCIAL_LINKS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={intl.formatMessage({ id: item.id })}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={intl.formatMessage({ id: "footer.column.explore" })}>
            <p className={styles.columnTitle}>
              <FormattedMessage id="footer.column.explore" />
            </p>
            <ul className={styles.links}>
              {EXPLORE_LINKS.map((item) => (
                <li key={item.id}>
                  <Link to={item.to}>
                    <FormattedMessage id={item.id} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={intl.formatMessage({ id: "footer.column.atlas" })}>
            <p className={styles.columnTitle}>
              <FormattedMessage id="footer.column.atlas" />
            </p>
            <ul className={styles.links}>
              {ATLAS_LINKS.map((item) => (
                <li key={item.id}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    <FormattedMessage id={item.id} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bar}>
          <p className={styles.copyright}>
            <FormattedMessage id="footer.copyright" values={{ year }} />
          </p>
        </div>
      </Container>
    </footer>
  );
}
