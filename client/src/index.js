import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { routes } from "./routes";
import Layout from "./routes/Layout";
import { ConfirmProvider } from "material-ui-confirm";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {routes.map((route, index) => (
                <Route path={route.path} element={route.element} key={index} />
              ))}
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ThemeProvider>
  </React.StrictMode>
);
