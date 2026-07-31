import { createBrowserRouter } from "react-router";

// Views
import Dashboard from "./views/Dashboard";
import Home from "./views/Home";

// Page loader & error components
import PageError from "./components/PageError";

import api from "#/api";

const notFoundLoader = () => {
  throw new Response("Not Found", { status: 404 });
};

const router = createBrowserRouter([
  {
    path: "",
    element: <Dashboard />,
    errorElement: <PageError />,
    children: [
      {
        path: "",
        element: <Home />,
        loader: async () => {
          try {
            return await api.opus.list();
          } catch (_) {
            return [];
          }
        },
      },
      {
        path: "*",
        loader: notFoundLoader,
        errorElement: <PageError />,
      },
    ],
  },
]);

export default router;
