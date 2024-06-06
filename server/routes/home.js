const express = require("express");
const { firestore } = require("../firebase");
const { get } = require("lodash");
const homeRouter = express.Router();

homeRouter.get("/getGeneralData", async (req, res) => {
  try {
    const classificationDoc = await firestore
      .collection("counts")
      .doc("classification")
      .get();
    const categoryDoc = await firestore
      .collection("counts")
      .doc("category")
      .get();

    if (!classificationDoc.exists || !categoryDoc.exists) {
      res.status(404).send({ error: "No data found for this page" });
      return;
    }

    const classificationCounts = classificationDoc.data();
    const categoryCounts = categoryDoc.data();

    res
      .status(200)
      .send({ classification: classificationCounts, category: categoryCounts });
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});

homeRouter.get("/update-thumbnail", async (req, res) => {
  try {
    const result = [];
    const defaultThumbnail = `https://sucmanh2000.com/wp-content/uploads/2020/10/fl1-2-1.png`;
    const collections = [
      "du-an-2012",
      "du-an-2014-2015",
      "du-an-2016",
      "du-an-2017",
      "du-an-2018",
      "du-an-2019",
      "du-an-2020",
      "du-an-2021",
      "du-an-2022",
      "du-an-2023",
      "du-an-2024",
    ];
    const fieldsToGetImages = [
      "content.tabs.2.slide_show.0.image",
      "content.tabs.1.slide_show.0.image",
      "content.tabs.0.slide_show.0.image",
    ];
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const postCollectionRef = firestore.collection(collection);
      const postCollectionSnapshot = await postCollectionRef.get();
      const postCollectionData = postCollectionSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      postCollectionData.forEach(async (post) => {
        const postId = post.id;
        thumbnail =
          get(post, fieldsToGetImages[0], defaultThumbnail) ||
          get(post, fieldsToGetImages[1], defaultThumbnail) ||
          get(post, fieldsToGetImages[2], defaultThumbnail) ||
          defaultThumbnail;
        result.push({
          collection,
          postId,
          thumbnail,
        });
        try {
          await firestore
            .collection(collection)
            .doc(postId)
            .update({ thumbnail });
        } catch (_) {
          console.log(`Failed to update thumbnail: ${collection}/${postId}`);
        }
      });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    res.status(500).send({ error: "Failed to fetch data" });
  }
});

module.exports = homeRouter;
