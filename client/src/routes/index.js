import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import PostList from "../pages/PostList";
import PostDetails from "../pages/PostDetails";
import Search from "../pages/Search";

export const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/gioi-thieu",
    element: <GioiThieu />,
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
];

export const router = createBrowserRouter(routes);
