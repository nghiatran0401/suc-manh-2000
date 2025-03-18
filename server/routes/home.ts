import express from "express";
import { Request, Response } from "express";
import { firestore } from "../firebase";
import { getValueInRedis, setExValueInRedis } from "../services/redis";

const homeRouter = express.Router();

homeRouter.get("/getTotalStatisticsCount", async (req: Request, res: Response) => {
  const cachedKey = `totalStatisticsCount`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

    if (cachedResultData) {
      res.status(200).send(JSON.stringify(cachedResultData));
    } else {
      const [classificationDoc, categoryDoc, provinceDoc, metadataDoc] = await Promise.all([
        firestore.collection("counts").doc("classification").get(),
        firestore.collection("counts").doc("category").get(),
        firestore.collection("counts").doc("province").get(),
        firestore.collection("counts").doc("metadata").get(),
      ]);

      if (!classificationDoc.exists || !categoryDoc.exists) {
        res.status(404).send({ error: "No data found for this page" });
      }
      const resultData = { classification: classificationDoc.data(), category: categoryDoc.data(), province: provinceDoc.data(), metadata: metadataDoc.data() };

      await setExValueInRedis(cachedKey, resultData, true);
      res.status(200).send(JSON.stringify(resultData));
    }
  } catch (error: any) {
    res.status(500).send({ error: `[getTotalStatisticsCount] failed: ${error.message}` });
  }
});

homeRouter.get("/getTotalProjectsCount", async (req: Request, res: Response) => {
  const cachedKey = `totalProjectsCount`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

    if (cachedResultData) {
      res.status(200).send(JSON.stringify(cachedResultData));
    } else {
      const collections = await firestore.listCollections();
      const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));

      const counts = await Promise.all(
        duAnCollections.map(async (collection) => {
          const snapshot = await collection.where("status", "in", ["dang-xay-dung", "da-hoan-thanh"]).get();
          return snapshot.size;
        })
      );
      const resultData = counts.reduce((a, b) => a + b, 0);

      await setExValueInRedis(cachedKey, resultData, true);
      res.status(200).send(JSON.stringify(resultData));
    }
  } catch (error: any) {
    res.status(500).send({ error: `[getTotalProjectsCount] failed: ${error.message}` });
  }
});

homeRouter.get("/getTotalStudentsCount", async (req: Request, res: Response) => {
  const cachedKey = `totalStudentsCount`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

    if (cachedResultData) {
      res.status(200).send(JSON.stringify(cachedResultData));
    } else {
      const collections = await firestore.listCollections();
      const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));

      const totalStudents = await Promise.all(
        duAnCollections.map(async (collection) => {
          const snapshot = await collection.where("status", "in", ["dang-xay-dung", "da-hoan-thanh"]).get();
          let total = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.metadata) {
              let totalStudents = Number(data.metadata.totalStudents);
              if (!isNaN(totalStudents) && totalStudents > 0) {
                total += totalStudents;
              }
            }
          });
          return total;
        })
      );

      const resultData = totalStudents.reduce((a, b) => a + b, 0);

      await setExValueInRedis(cachedKey, resultData, true);
      res.status(200).send(JSON.stringify(resultData));
    }
  } catch (error: any) {
    res.status(500).send({ error: `[getTotalStudentsCount] failed: ${error.message}` });
  }
});

export default homeRouter;
