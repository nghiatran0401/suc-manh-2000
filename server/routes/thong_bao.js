const express = require("express");
const fs = require("fs");

const thongBaoRouter = express.Router();

// Show a list of Thông báo
thongBaoRouter.get("/", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_posts.json", "utf8");
  const data = JSON.parse(jsonData);

  const idToStartFrom = "17460";
  const indexToStartFrom = data.findIndex((item) => item.id === idToStartFrom);

  if (indexToStartFrom !== -1) {
    const slicedData = data.slice(indexToStartFrom, indexToStartFrom + 10);
    res.status(200).send({ data: slicedData });
  } else {
    res.status(404).send({ error: "ID not found" });
  }
});

// Show a detailed page
thongBaoRouter.get("/:id", (req, res) => {
  res.status(200).send({});
});

module.exports = thongBaoRouter;
