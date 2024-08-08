const express = require("express");
const { firestore } = require("../firebase");
const { getValueInRedis, setExValueInRedis } = require("../services/redis");

const homeRouter = express.Router();

homeRouter.get("/getClassificationAndCategoryCounts", async (req, res) => {
  try {
    const [classificationDoc, categoryDoc, provinceDoc] = await Promise.all([
      firestore.collection("counts").doc("classification").get(),
      firestore.collection("counts").doc("category").get(),
      firestore.collection("counts").doc("province").get(),
    ]);

    if (!classificationDoc.exists || !categoryDoc.exists) {
      res.status(404).send({ error: "No data found for this page" });
    }

    res.status(200).send({ classification: classificationDoc.data(), category: categoryDoc.data(), province: provinceDoc.data() });
  } catch (error) {
    res.status(500).send({ error: `Failed to fetch data: ${error.message}` });
  }
});

homeRouter.get("/getTotalProjectsCount", async (req, res) => {
  const cachedKey = `totalProjectsCount`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

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

      await setExValueInRedis(cachedKey, resultData, true);
      res.status(200).send(String(resultData));
    }
  } catch (error) {
    res.status(500).send({ error: `Failed to fetch data: ${error.message}` });
  }
});
module.exports = homeRouter;
