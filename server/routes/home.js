const express = require("express");
const fs = require("fs");

const homeRouter = express.Router();

// Show a list of Tin tức / Dự án
homeRouter.get("/", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_posts.json", "utf8");
  const data = JSON.parse(jsonData).data;

  res.status(200).send({ data: data.slice(0, 10) });
});

module.exports = homeRouter;
