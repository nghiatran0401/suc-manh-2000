import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import ThongBao from "../pages/thong_bao/ThongBao";
import DuAn2024 from "../pages/DuAn2024";
import ThongBaoDetails from "../pages/thong_bao/ThongBaoDetails";

export const routes = [
  {
    path: "/",
    name: "Home",
    element: <Home />,
  },
  {
    path: "/gioi-thieu",
    name: "Gioi thieu",
    element: <GioiThieu />,
  },
  {
    path: "/thong-bao",
    name: "Thong bao",
    element: <ThongBao />,
  },
  {
    path: "/thong-bao/:id",
    name: "Thong bao details",
    element: <ThongBaoDetails />,
  },
  {
    path: "/du-an-2024",
    name: "Du an 2024",
    element: <DuAn2024 />,
  },
];

export const router = createBrowserRouter(routes);
