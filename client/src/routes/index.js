import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import PostList from "../pages/PostList";
import PostDetails from "../pages/PostDetails";

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
];

export const router = createBrowserRouter(routes);
