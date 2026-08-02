import handleSignout from "#/helpers/auth/handleSignout";
import type { ThemePreference } from "#/helpers/theme";
import { useColorMode } from "#/helpers/useColorMode";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink, useParams } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCheck,
  faCircleHalfStroke,
  faCog,
  faMoon,
  faSignIn,
  faSignOut,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { useAuth } from "react-oidc-context";

import styles from "./Header.module.css";

const COLLECTION_NAV_ITEMS = [
  { label: "Home", path: "", end: true },
  { label: "Browse", path: "/browse" },
  { label: "Filter", path: "/filter" },
  { label: "Glossary", path: "/glossary" },
  { label: "About", path: "/about" },
] as const;

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: IconDefinition;
}[] = [
  { value: "light", label: "Light", icon: faSun },
  { value: "dark", label: "Dark", icon: faMoon },
  { value: "auto", label: "Auto", icon: faCircleHalfStroke },
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
      {THEME_OPTIONS.map(({ value, label, icon }) => {
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
            {label}
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
      {THEME_OPTIONS.map(({ value, label, icon }) => {
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
            {label}
            {active && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
          </Nav.Link>
        );
      })}
    </>
  );
}

export function Header() {
  const auth = useAuth();
  const { slug } = useParams<{ slug?: string }>();
  const { theme, setTheme } = useColorMode();

  const userNavItems = auth.isAuthenticated ? (
    <>
      <Nav.Link className="d-flex align-items-center gap-2">
        <FontAwesomeIcon icon={faUser} />
        My Profile
      </Nav.Link>
      <Nav.Link className="d-flex align-items-center gap-2">
        <FontAwesomeIcon icon={faCog} />
        Admin
      </Nav.Link>
      <Nav.Link
        className="d-flex align-items-center gap-2"
        onClick={() => handleSignout(auth)}
      >
        <FontAwesomeIcon icon={faSignOut} />
        Logout
      </Nav.Link>
    </>
  ) : (
    <Nav.Link
      className="d-flex align-items-center gap-2"
      onClick={() => auth.signinRedirect()}
    >
      <FontAwesomeIcon icon={faSignIn} />
      Sign in
    </Nav.Link>
  );

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container className="px-0">
        {/* <Navbar.Brand href="#home"></Navbar.Brand> */}
        <Navbar.Toggle aria-controls="primary-navbar-nav" />
        <Navbar.Collapse id="primary-navbar-nav">
          {slug && (
            <Nav className="me-auto">
              {COLLECTION_NAV_ITEMS.map((item) => (
                <Nav.Link
                  key={item.label}
                  as={NavLink}
                  to={`/opus/${slug}${item.path}`}
                  end={"end" in item ? item.end : false}
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          )}

          {/* Mobile: search + account links as normal nav items */}
          {slug && <hr className={`d-lg-none ${styles.separator}`} />}
          <Nav className="d-lg-none flex-column">
            <Form className="py-2">
              <Form.Control type="text" placeholder="Search" />
            </Form>
            {userNavItems}
            <hr className={styles.separator} />
            <ThemeNavLinks theme={theme} setTheme={setTheme} />
          </Nav>

          {/* Desktop: search + hamburger dropdown */}
          <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
            <Form>
              <Form.Control type="text" placeholder="Search" />
            </Form>
            <Nav>
              <NavDropdown
                align="end"
                id="user-menu-dropdown"
                title={<FontAwesomeIcon icon={faBars} />}
              >
                {auth.isAuthenticated ? (
                  <>
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faUser} />
                      My Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faCog} />
                      Admin
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="d-flex align-items-center gap-2"
                      onClick={() => handleSignout(auth)}
                    >
                      <FontAwesomeIcon icon={faSignOut} />
                      Logout
                    </NavDropdown.Item>
                  </>
                ) : (
                  <NavDropdown.Item
                    className="d-flex align-items-center gap-2"
                    onClick={() => auth.signinRedirect()}
                  >
                    <FontAwesomeIcon icon={faSignIn} />
                    Sign in
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Header>Theme</NavDropdown.Header>
                <ThemeMenuItems theme={theme} setTheme={setTheme} />
              </NavDropdown>
            </Nav>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
