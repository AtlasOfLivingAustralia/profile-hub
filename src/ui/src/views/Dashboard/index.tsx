// Routing
import { Outlet } from "react-router";
import { Header } from "./components/Header";

function Dashboard() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default Dashboard;
