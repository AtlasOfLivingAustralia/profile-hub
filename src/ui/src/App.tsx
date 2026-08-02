import { useEffect } from "react";

// Routing
import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
import { RouterProvider } from "react-router/dom";

// Authentication
import { useAuth } from "react-oidc-context";

// Local components
import PageLoader from "./components/PageLoader";
import handleRefresh from "./helpers/auth/handleRefresh";
import routes from "./Router";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/bootstrap-theme.css";

function App() {
  const auth = useAuth();

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this hook to trigger when isAuthenticated changes
  useEffect(() => {
    if (auth.isAuthenticated) {
      const refreshInterval = setInterval(async () => {
        if ((auth.user?.expires_in || 0) < 60) await handleRefresh(auth);
      }, 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [auth.isAuthenticated]);

  // If the user hasn't been authenticated, show a page loader instead
  return auth.isLoading ? (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PageLoader />
    </div>
  ) : (
    <NuqsAdapter>
      <RouterProvider router={routes} />
    </NuqsAdapter>
  );
}

export default App;
