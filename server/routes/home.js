const express = require("express");
const fs = require("fs");

const homeRouter = express.Router();

homeRouter.get("/getGeneralData", (req, res) => {
  const database = fs.readFileSync("../server/transformed_pages.json", "utf8");
  const data = JSON.parse(database);

  const classificationCounts = data.reduce((counts, page) => {
    const classification = page.classification;
    if (!counts[classification]) {
      counts[classification] = 0;
    }
    counts[classification]++;
    if (classification !== "loai-khac") {
      counts.total = (counts.total || 0) + 1;
    }
    return counts;
  }, {});

  const categoryCounts = data.reduce((counts, page) => {
    const category = page.category;
    if (!counts[category]) {
      counts[category] = 0;
    }
    counts[category]++;
    return counts;
  }, {});

  res.status(200).send({ classification: classificationCounts, category: categoryCounts });
});

module.exports = homeRouter;
