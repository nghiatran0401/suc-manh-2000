import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import GioiThieu from "./components/GioiThieu";
import ThongBao from "./components/ThongBao";
import DuAn2024 from "./components/DuAn2024";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/gioi-thieu",
    element: <GioiThieu />,
  },
  {
    path: "/thong-bao",
    element: <ThongBao />,
  },
  {
    path: "/du-an-2024",
    element: <DuAn2024 />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
