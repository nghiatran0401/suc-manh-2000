const express = require("express");
const { firestore } = require("../firebase");
const { getValue, setExValue } = require("../services/redis");

const homeRouter = express.Router();

homeRouter.get("/getClassificationAndCategoryCounts", async (req, res) => {
  const cachedKey = `classificationAndCategoryCounts`;

  try {
    const cachedResultData = await getValue(cachedKey);

    if (cachedResultData) {
      res.status(200).send(cachedResultData);
    } else {
      const classificationDoc = await firestore.collection("counts").doc("classification").get();
      const categoryDoc = await firestore.collection("counts").doc("category").get();

      if (!classificationDoc.exists || !categoryDoc.exists) {
        res.status(404).send({ error: "No data found for this page" });
        return;
      }

      const classificationCounts = classificationDoc.data();
      const categoryCounts = categoryDoc.data();
      const resultData = { classification: classificationCounts, category: categoryCounts };

      await setExValue(cachedKey, resultData);
      res.status(200).send(resultData);
    }
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});

homeRouter.get("/getTotalProjectsCount", async (req, res) => {
  const cachedKey = `totalProjectsCount`;

  try {
    const cachedResultData = await getValue(cachedKey);

    if (cachedResultData) {
      res.status(200).send(String(cachedResultData));
    } else {
      const collections = await firestore.listCollections();
      const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));

      const counts = await Promise.all(
        duAnCollections.map(async (collection) => {
          const snapshot = await collection.where("status", "!=", "can-quyen-gop").get();
          return snapshot.size;
        })
      );
      const resultData = counts.reduce((a, b) => a + b, 0);

      await setExValue(cachedKey, resultData);
      res.status(200).send(resultData);
    }
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});
module.exports = homeRouter;
