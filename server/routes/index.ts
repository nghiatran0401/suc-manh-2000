import { Express } from "express";
import homeRouter from "./home";
import postRouter from "./post";
import searchRouter from "./search";
import scriptRouter from "./script";
import statementRouter from "./statement";

export default function routes(app: Express) {
  app.use("/", homeRouter);
  app.use("/search", searchRouter);
  app.use("/statement", statementRouter);
  app.use("/script", scriptRouter);
  app.use("/:category", postRouter);
}
