const express = require("express");
const { redisSearchByName } = require("../services/redis");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  const { q, categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter } = req.query;

  try {
    if (!q && Object.keys(filters).length === 0) {
      return res.status(200).send([]);
    }

    const filters = { categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter };
    const searchResult = await redisSearchByName(q, filters);
    res.status(200).send(searchResult);
  } catch (error) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

module.exports = searchRouter;
