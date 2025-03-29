import { Express } from "express";
import homeRouter from "./home";
import postRouter from "./post";
import searchRouter from "./search";
import scriptRouter from "./script";
import donorRouters from "./donor";
export default function routes(app: Express) {
  app.use("/", homeRouter);
  app.use("/search", searchRouter);
  app.use("/script", scriptRouter);
  app.use("/nha-tai-tro", donorRouters);
  app.use("/:category", postRouter);
}
