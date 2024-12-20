import express from "express";
import { Request, Response } from "express";
import { getRedisDataWithKeyPattern } from "../services/redis";

const donationRouter = express.Router({ mergeParams: true });

donationRouter.get("/", async (req: Request, res: Response) => {
  try {
    const donationKeyPattern = `donation:*`;
    const data = await getRedisDataWithKeyPattern(donationKeyPattern);

    res.status(200).send({ donations: data, });
  } catch (error: any) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

export default donationRouter;
