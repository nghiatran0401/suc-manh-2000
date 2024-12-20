import express from "express";
import { Request, Response } from "express";
import { getRedisDataWithKeyPattern } from "../services/redis";

const donorRouter = express.Router({ mergeParams: true });

donorRouter.get("/", async (req: Request, res: Response) => {
  try {
    const donorKeyPattern = `donor:*`;
    const data = await getRedisDataWithKeyPattern(donorKeyPattern);

    res.status(200).send({ donors: data, });
  } catch (error: any) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

export default donorRouter;
