
import handleSignout from "#/helpers/auth/handleSignout";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCog, faSignIn, faSignOut, faUser } from '@fortawesome/free-solid-svg-icons';

import { useAuth } from "react-oidc-context";

export function Header() {
	const auth = useAuth();

	return (
		<Navbar expand="lg" className="bg-body-tertiary">
			<Container>
				<Navbar.Brand href="#home">Profiles</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="user-menu-dropdown" className="justify-content-end">
					<div className="d-flex gap-3">
						<Form>
							<Row>
								<Col xs="auto">
									<Form.Control
										type="text"
										placeholder="Search"
										className=" mr-sm-2"
									/>
								</Col>
							</Row>
						</Form>
						<Nav>
							{auth.isAuthenticated ? (
								<NavDropdown align="end" id="user-menu-dropdown" title={<FontAwesomeIcon icon={faBars} />}>
									<NavDropdown.Item className="d-flex align-items-center gap-2">
										<FontAwesomeIcon icon={faUser} />
										My Profile
									</NavDropdown.Item>
									<NavDropdown.Item className="d-flex align-items-center gap-2">
										<FontAwesomeIcon icon={faCog} />
										Admin
									</NavDropdown.Item>
									<NavDropdown.Item className="d-flex align-items-center gap-2" onClick={() => handleSignout(auth)}>
										<FontAwesomeIcon icon={faSignOut} />
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							) : (
								<Nav.Link className="d-flex align-items-center gap-2" onClick={() => auth.signinRedirect()}>
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
