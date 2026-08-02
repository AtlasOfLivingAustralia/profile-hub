import { createBrowserRouter } from "react-router";

// Views
import Dashboard from "./views/Dashboard";
import Home from "./views/Home";

// Page loader & error components
import PageError from "./components/PageError";

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
      },
      {
        path: "opus/:slug",
        lazy: () => import("./views/Collection"),
        errorElement: <PageError />,
        children: [
          {
            index: true,
            lazy: () => import("./views/CollectionHome"),
          },
          {
            path: "browse",
            lazy: () => import("./views/Browse"),
          },
          {
            path: "filter",
            lazy: () => import("./views/Filter"),
          },
          {
            path: "glossary/:letter?",
            lazy: () => import("./views/Glossary"),
          },
          {
            path: "about",
            lazy: () => import("./views/About"),
          },
        ],
      },
      {
        path: "*",
        loader: notFoundLoader,
      },
    ],
  },
]);

export default router;
