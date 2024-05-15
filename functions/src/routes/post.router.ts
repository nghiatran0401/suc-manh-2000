import * as express from "express";
const postRouter = express.Router();
import { AuthMiddleware } from "../middleware/auth";
import {
  addNewPost,
  getPostById,
  getPoststList,
  removePostById,
  updatePostById,
} from "../controllers/post.controller";

postRouter.get("/", getPoststList);
postRouter.post("/", AuthMiddleware, addNewPost);
postRouter.get("/:id", getPostById);
postRouter.patch("/:id", AuthMiddleware, updatePostById);
postRouter.delete("/:id", AuthMiddleware, removePostById);

export default postRouter;
