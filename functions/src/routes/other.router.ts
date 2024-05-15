import * as express from "express";
import { Response, Request } from "express";

const otherRouter = express.Router();

otherRouter.get("/", (req: Request, res: Response) => {
  res.send(`Server is running on ${process.env.CURRENT_ENV} now!!!`);
});


export default otherRouter;
