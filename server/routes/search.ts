import express from "express";
import { Request, Response } from "express";
import { redisSearchByName } from "../services/redis";

const searchRouter = express.Router();

searchRouter.get("/", async (req: Request, res: Response) => {
  const { q, filters, sortField } = req.query;
  const noFilters = filters && Object.values(filters).every((f) => f === "all");

  try {
    const { cachedResultData, totalValuesLength, statsData, provinceCount } = await redisSearchByName(q, noFilters ? {} : filters, Array.isArray(sortField) ? sortField[0] : sortField);
    res.status(200).send({ posts: cachedResultData, totalPosts: totalValuesLength, stats: statsData, provinceCount });
  } catch (error: any) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

export default searchRouter;
