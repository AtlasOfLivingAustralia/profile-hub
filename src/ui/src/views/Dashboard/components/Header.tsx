import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faCheck,
  faCircleHalfStroke,
  faCog,
  faHouse,
  faLanguage,
  faMoon,
  faSignIn,
  faSignOut,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FormattedMessage, useIntl } from "react-intl";
import { useAuth } from "react-oidc-context";
import { NavLink, useParams } from "react-router";
import handleSignout from "#/helpers/auth/handleSignout";
import { useLocale } from "#/helpers/context/useLocale";
import { APP_LOCALES, type AppLocale, LOCALE_LABELS } from "#/helpers/locale";
import type { ThemePreference } from "#/helpers/theme";
import { useColorMode } from "#/helpers/useColorMode";

import styles from "./Header.module.css";

const COLLECTION_NAV_ITEMS = [
  { messageId: "nav.collection.home", path: "", end: true },
  { messageId: "nav.collection.browse", path: "/browse" },
  { messageId: "nav.collection.filter", path: "/filter" },
  { messageId: "nav.collection.glossary", path: "/glossary" },
  { messageId: "nav.collection.about", path: "/about" },
] as const;

const THEME_OPTIONS: {
  value: ThemePreference;
  messageId: string;
  icon: IconDefinition;
}[] = [
  { value: "light", messageId: "theme.light", icon: faSun },
  { value: "dark", messageId: "theme.dark", icon: faMoon },
  { value: "auto", messageId: "theme.auto", icon: faCircleHalfStroke },
];

function ThemeMenuItems({
  theme,
  setTheme,
}: {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}) {
  return (
    <>
      {THEME_OPTIONS.map(({ value, messageId, icon }) => {
        const active = theme === value;
        return (
          <NavDropdown.Item
            key={value}
            active={active}
            aria-pressed={active}
            data-bs-theme-value={value}
            className="d-flex align-items-center gap-2"
            onClick={() => setTheme(value)}
          >
            <FontAwesomeIcon icon={icon} fixedWidth />
            <FormattedMessage id={messageId} />
            {active && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
          </NavDropdown.Item>
        );
      })}
    </>
  );
}

function ThemeNavLinks({
  theme,
  setTheme,
}: {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}) {
  return (
    <>
      {THEME_OPTIONS.map(({ value, messageId, icon }) => {
        const active = theme === value;
        return (
          <Nav.Link
            key={value}
            active={active}
            aria-pressed={active}
            data-bs-theme-value={value}
            className="d-flex align-items-center gap-2"
            onClick={() => setTheme(value)}
          >
            <FontAwesomeIcon icon={icon} fixedWidth />
            <FormattedMessage id={messageId} />
            {active && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
          </Nav.Link>
        );
      })}
    </>
  );
}

function LanguageMenuItems({
  locale,
  setLocale,
}: {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}) {
  return (
    <>
      {APP_LOCALES.map((value) => {
        const active = locale === value;
        return (
          <NavDropdown.Item
            key={value}
            active={active}
            aria-pressed={active}
            lang={value}
            className="d-flex align-items-center gap-2"
            onClick={() => setLocale(value)}
          >
            {LOCALE_LABELS[value]}
            {active && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
          </NavDropdown.Item>
        );
      })}
    </>
  );
}

function LanguageDropdown({
  locale,
  setLocale,
  className,
}: {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  className?: string;
}) {
  const intl = useIntl();

  return (
    <NavDropdown
      align="end"
      id="language-menu-dropdown"
      className={`${styles.hideCaret} ${className ?? ""}`}
      title={<FontAwesomeIcon icon={faLanguage} />}
      aria-label={intl.formatMessage({ id: "nav.language.header" })}
    >
      <LanguageMenuItems locale={locale} setLocale={setLocale} />
    </NavDropdown>
  );
}

export function Header() {
  const auth = useAuth();
  const intl = useIntl();
  const { slug } = useParams<{ slug?: string }>();
  const { theme, setTheme } = useColorMode();
  const { locale, setLocale } = useLocale();

  const userNavItems = auth.isAuthenticated ? (
    <>
      <Nav.Link className="d-flex align-items-center gap-2">
        <FontAwesomeIcon icon={faUser} />
        <FormattedMessage id="nav.user.myProfile" />
      </Nav.Link>
      <Nav.Link className="d-flex align-items-center gap-2">
        <FontAwesomeIcon icon={faCog} />
        <FormattedMessage id="nav.user.admin" />
      </Nav.Link>
      <Nav.Link
        className="d-flex align-items-center gap-2"
        onClick={() => handleSignout(auth)}
      >
        <FontAwesomeIcon icon={faSignOut} />
        <FormattedMessage id="nav.user.logout" />
      </Nav.Link>
    </>
  ) : (
    <Nav.Link
      className="d-flex align-items-center gap-2"
      onClick={() => auth.signinRedirect()}
    >
      <FontAwesomeIcon icon={faSignIn} />
      <FormattedMessage id="nav.user.signIn" />
    </Nav.Link>
  );

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container className="px-0">
        <Navbar.Brand
          as={NavLink}
          to="/"
          end
          aria-label={intl.formatMessage({ id: "nav.home.ariaLabel" })}
          className={`d-inline-flex align-items-center px-2 ${styles.homeLink}`}
        >
          <FontAwesomeIcon icon={faHouse} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="primary-navbar-nav" />
        <Navbar.Collapse id="primary-navbar-nav">
          {slug && (
            <Nav className="me-auto">
              {COLLECTION_NAV_ITEMS.map((item) => (
                <Nav.Link
                  key={item.messageId}
                  as={NavLink}
                  to={`/opus/${slug}${item.path}`}
                  end={"end" in item ? item.end : false}
                >
                  <FormattedMessage id={item.messageId} />
                </Nav.Link>
              ))}
            </Nav>
          )}

          {/* Mobile: search + account links as normal nav items */}
          {slug && <hr className={`d-lg-none ${styles.separator}`} />}
          <Nav className="d-lg-none flex-column">
            <Form className="py-2">
              <Form.Control
                type="text"
                placeholder={intl.formatMessage({
                  id: "nav.search.placeholder",
                })}
              />
            </Form>
            {userNavItems}
            <hr className={styles.separator} />
            <LanguageDropdown locale={locale} setLocale={setLocale} />
            <hr className={styles.separator} />
            <Nav.Link disabled className="text-body-secondary py-1">
              <FormattedMessage id="nav.theme.header" />
            </Nav.Link>
            <ThemeNavLinks theme={theme} setTheme={setTheme} />
          </Nav>

          {/* Desktop: search + language + hamburger dropdown */}
          <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
            <Form>
              <Form.Control
                type="text"
                placeholder={intl.formatMessage({
                  id: "nav.search.placeholder",
                })}
              />
            </Form>
            <Nav>
              <LanguageDropdown locale={locale} setLocale={setLocale} />
              <NavDropdown
                align="end"
                id="user-menu-dropdown"
                className={styles.hideCaret}
                title={<FontAwesomeIcon icon={faBars} />}
              >
                {auth.isAuthenticated ? (
                  <>
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faUser} />
                      <FormattedMessage id="nav.user.myProfile" />
                    </NavDropdown.Item>
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faCog} />
                      <FormattedMessage id="nav.user.admin" />
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="d-flex align-items-center gap-2"
                      onClick={() => handleSignout(auth)}
                    >
                      <FontAwesomeIcon icon={faSignOut} />
                      <FormattedMessage id="nav.user.logout" />
                    </NavDropdown.Item>
                  </>
                ) : (
                  <NavDropdown.Item
                    className="d-flex align-items-center gap-2"
                    onClick={() => auth.signinRedirect()}
                  >
                    <FontAwesomeIcon icon={faSignIn} />
                    <FormattedMessage id="nav.user.signIn" />
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Header>
                  <FormattedMessage id="nav.theme.header" />
                </NavDropdown.Header>
                <ThemeMenuItems theme={theme} setTheme={setTheme} />
              </NavDropdown>
            </Nav>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
