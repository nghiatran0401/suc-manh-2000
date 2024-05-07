import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Home from "./pages/Home";
import GioiThieu from "./pages/GioiThieu";
import ThongBao from "./pages/ThongBao";
import DuAn2024 from "./pages/DuAn2024";

const theme = createTheme({
  typography: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontWeightBold: 700,
    fontWeightMedium: 500,
    fontWeightRegular: 400,
    fontWeightLight: 300,
  },
});

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
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
  