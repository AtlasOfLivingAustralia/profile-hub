import { Outlet, ScrollRestoration, useParams } from "react-router";

import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import styles from "./index.module.css";

function Dashboard() {
  const { slug } = useParams<{ slug?: string }>();

  return (
    <div className={styles.shell}>
      <ScrollRestoration />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      {!slug && <Footer />}
    </div>
  );
}

export default Dashboard;
