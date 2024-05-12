const express = require("express");
const fs = require("fs");

const homeRouter = express.Router();

// Show a list of Tin tức / Dự án
homeRouter.get("/", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_pages.json", "utf8");
  const data = JSON.parse(jsonData);

  const idToStartFrom = "15496";
  const indexToStartFrom = data.findIndex((item) => item.id === idToStartFrom);

  if (indexToStartFrom !== -1) {
    const slicedData = data.slice(indexToStartFrom, indexToStartFrom + 10);
    res.status(200).send({ data: slicedData });
  } else {
    res.status(404).send({ error: "ID not found" });
  }
});

module.exports = homeRouter;
