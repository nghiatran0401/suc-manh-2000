const express = require("express");
const { firestore } = require("../firebase");
const searchRouter = express.Router();
const { redisSearchByName } = require("../services/redis");
const { modifyNameForSearch } = require("../utils/search");

searchRouter.get("/", async (req, res) => {
  try {
    const searchKey = req.query.q;
    if (!searchKey) {
      return res
        .status(400)
        .json({ error: "Missing search query parameter q" });
    }
    
    const searchResult = await redisSearchByName(
      modifyNameForSearch(searchKey)
    );
    res.status(200).send(searchResult);
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});

module.exports = searchRouter;
