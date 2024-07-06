const express = require("express");
const { redisSearchByName } = require("../services/redis");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  try {
    const searchKey = req.query.q;
    if (!searchKey) {
      return res.status(200).send([]);
    }

    const filters = req.query.filters ?? {};
    const searchResult = await redisSearchByName(searchKey, filters);

    res.status(200).send(searchResult);
  } catch (error) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

module.exports = searchRouter;
