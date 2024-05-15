import { Express } from "express";
import projectRouter from "./project.router";
import postRouter from "./post.router";
import otherRouter from "./other.router";
function route(app: Express) {
  app.use("/", otherRouter);
  app.use("/projects", projectRouter);
  app.use("/posts", postRouter);
}
export default route;
