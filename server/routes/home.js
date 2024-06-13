const express = require("express");
const { firestore } = require("../firebase");
const homeRouter = express.Router();

homeRouter.get("/getGeneralData", async (req, res) => {
  try {
    const classificationDoc = await firestore.collection("counts").doc("classification").get();
    const categoryDoc = await firestore.collection("counts").doc("category").get();

    if (!classificationDoc.exists || !categoryDoc.exists) {
      res.status(404).send({ error: "No data found for this page" });
      return;
    }

    const classificationCounts = classificationDoc.data();
    const categoryCounts = categoryDoc.data();

    res.status(200).send({ classification: classificationCounts, category: categoryCounts });
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});

module.exports = homeRouter;
