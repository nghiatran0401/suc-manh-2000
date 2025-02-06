import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import PostList from "../pages/PostList";
import PostDetails from "../pages/PostDetails";
import Search from "../pages/Search";
import ChamPhamTool from "../pages/ChamPhamTool";
import Statement from "../pages/Statement";

export const routes = [
  {
    path: "",
    element: <Home />,
  },
  {
    path: "/gioi-thieu",
    element: <GioiThieu />,
  },
  {
    path: "/cham_pham_tool",
    element: <ChamPhamTool />,
  },
  {
    path: "/:category",
    element: <PostList />,
  },
  {
    path: "/:category/:id",
    element: <PostDetails />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/statement",
    element: <Statement />,
  },
];

export const router = createBrowserRouter(routes);
