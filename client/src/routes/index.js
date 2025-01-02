import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import PostList from "../pages/PostList";
import PostDetails from "../pages/PostDetails";
import Search from "../pages/Search";
import NttList from "../pages/NttList";
import NttDetails from "../pages/NttDetails";
import ChamPhamTool from "../pages/ChamPhamTool";

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
    path: "/ntt",
    element: <NttList/>
  },
  {
    path: "/ntt/:id",
    element: <NttDetails/>
  }
];

export const router = createBrowserRouter(routes);
