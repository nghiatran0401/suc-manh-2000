const express = require("express");
const { redisSearchByName } = require("../services/redis");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  const { q, filters } = req.query;
  const noFilters = Object.values(filters).every((f) => f === "all");

  try {
    const { cachedResultData, totalValuesLength, statsData, provinceCount } = await redisSearchByName(q, noFilters ? {} : filters);
    res.status(200).send({ posts: cachedResultData, totalPosts: totalValuesLength, stats: statsData, provinceCount });
  } catch (error) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

module.exports = searchRouter;
