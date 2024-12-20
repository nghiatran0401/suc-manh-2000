import { Express } from "express";
import homeRouter from "./home";
import postRouter from "./post";
import searchRouter from "./search";
import scriptRouter from "./script";
import donorRouter from "./donor";
import donationRouter from "./donation";

export default function routes(app: Express) {
  app.use("/donors", donorRouter);
  app.use("/donations", donationRouter);

  app.use("/", homeRouter);
  app.use("/search", searchRouter);
  app.use("/script", scriptRouter);
  app.use("/:category", postRouter);
}
