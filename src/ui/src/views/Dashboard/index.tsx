// Routing
import { Outlet, ScrollRestoration } from "react-router";
import { Header } from "./components/Header";

function Dashboard() {
  return (
    <>
      <ScrollRestoration />
      <Header />
      <Outlet />
    </>
  );
}

export default Dashboard;
