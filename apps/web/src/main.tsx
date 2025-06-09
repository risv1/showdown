import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

import DashLayout from "./layouts/DashLayout";
import Auth from "./pages/Auth";
import GlobalError from "./pages/GlobalError";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DashboardCreate from "./pages/dashboard/DashboardCreate";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardJoin from "./pages/dashboard/DashboardJoin";
import TournamentId from "./pages/dashboard/tournaments/TournamentId";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <GlobalError />,
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <GlobalError />,
  },
  {
    path: "/dashboard",
    element: <DashLayout />,
    errorElement: <GlobalError />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "create",
        element: <DashboardCreate />,
      },
      {
        path: "join",
        element: <DashboardJoin />,
      },
      {
        path: "tournaments/:id",
        element: <TournamentId />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
