// Routing
import { Outlet } from "react-router";
import { Header } from "./components/Header";

import Container from "react-bootstrap/Container";

function Dashboard() {
  return (
    <>
      <Header />
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}

export default Dashboard;
