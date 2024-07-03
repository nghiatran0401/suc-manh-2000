const express = require("express");
const { redisSearchByName } = require("../services/redis");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  try {
    const searchKey = req.query.q;
    if (!searchKey) {
      return res.status(200).send([]);
    }

    const searchResult = await redisSearchByName(searchKey);

    res.status(200).send(searchResult);
  } catch (error) {
    res.status(404).send({ error: `Failed to search data: ${error.message}` });
  }
});

module.exports = searchRouter;
