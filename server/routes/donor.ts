import express from "express";
import { Request, Response } from "express";
import { getRedisDataWithKeyPattern } from "../services/redis";

const donorRouter = express.Router({ mergeParams: true });

donorRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const sortField = req.query.sortField as string || "name";

    const donorKeyPattern = `donor:*`;
    const data = await getRedisDataWithKeyPattern(donorKeyPattern, sortField);
    const resultDonors = data.slice(startIndex, endIndex);

    res.status(200).send({ 
      donors: resultDonors,
      totalDonors: data.length,
    });
  } catch (error: any) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

donorRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const detailDonorKey = `donor:${id}`;
    const data = await getRedisDataWithKeyPattern(detailDonorKey);
    
    res.status(200).json({
      donor: data
    });
  } catch (error: any) {
    res.status(404).send({ error: `Error getting a document: ${error.message}` });
  }
});

export default donorRouter;
