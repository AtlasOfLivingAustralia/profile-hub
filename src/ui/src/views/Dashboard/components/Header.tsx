import handleSignout from "#/helpers/auth/handleSignout";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink, useParams } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBars,
	faCog,
	faSignIn,
	faSignOut,
	faUser,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "react-oidc-context";

import styles from "./Header.module.css";

const COLLECTION_NAV_ITEMS = [
	{ label: "Home", path: "", end: true },
	{ label: "Browse", path: "/browse" },
	{ label: "Filter", path: "/filter" },
	{ label: "Glossary", path: "/glossary" },
	{ label: "About", path: "/about" },
] as const;

export function Header() {
	const auth = useAuth();
	const { slug } = useParams<{ slug?: string }>();

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
					</Nav>

					{/* Desktop: search + hamburger dropdown */}
					<div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
						<Form>
							<Form.Control type="text" placeholder="Search" />
						</Form>
						<Nav>
							{auth.isAuthenticated ? (
								<NavDropdown
									align="end"
									id="user-menu-dropdown"
									title={<FontAwesomeIcon icon={faBars} />}
								>
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
								</NavDropdown>
							) : (
								<Nav.Link
									className="d-flex align-items-center gap-2"
									onClick={() => auth.signinRedirect()}
								>
									<FontAwesomeIcon icon={faSignIn} />
									Sign in
								</Nav.Link>
							)}
						</Nav>
					</div>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
