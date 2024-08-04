const express = require("express");
const { redisSearchByName } = require("../services/redis");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  const { _start, _end } = req.query;

  try {
    const searchKey = req.query.q;
    const filters = req.query.filters ?? {};

    if (!searchKey && Object.keys(filters).length === 0) {
      return res.status(200).send([]);
    }

    const searchResult = await redisSearchByName(searchKey, filters, Number(_start), Number(_end));

    res.status(200).send(searchResult);
  } catch (error) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

module.exports = searchRouter;
