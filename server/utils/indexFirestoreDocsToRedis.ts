import { firestore } from "../firebase";
import { convertToCleanedName } from "./index";
import Redis from "ioredis";
import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const redis = new Redis(process.env.REDIS_URL || "");

const INDEX_NAME = "post_index";
const INDEX_SCHEMA = [
  "SCHEMA",
  "id",
  "TEXT",
  "slug",
  "TEXT",
  "name",
  "TEXT",
  "cleanedName",
  "TEXT",
  "createdAt",
  "TEXT",
  "thumbnail",
  "TEXT",
  "category",
  "TAG",
  "classification",
  "TAG",
  "status",
  "TAG",
  "statusOrder",
  "TAG",
  "totalFund",
  "NUMERIC",
  "province",
  "TAG",
  "constructionUnit",
  "TAG",
];

export async function indexFirestoreDocsToRedis() {
  await redis.call("FLUSHALL");
  await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();

    const promises = snapshot.docs.map(async (doc) => {
      const data: any = {
        ...doc.data(),
        collection_id: collection.id,
        doc_id: doc.id,
      };

      const statusOrderMap: Record<string, number> = {
        "can-quyen-gop": 1,
        "dang-xay-dung": 2,
        "da-hoan-thanh": 3,
      };

      await redis.call(
        "FT.ADD",
        INDEX_NAME,
        `post:${data.collection_id}:${data.doc_id}`,
        1.0,
        "REPLACE",
        "FIELDS",
        "id",
        data.id,
        "slug",
        data.slug,
        "name",
        data.name,
        "cleanedName",
        convertToCleanedName(data.name),
        "createdAt",
        data.createdAt?.toDate(),
        "thumbnail",
        data.thumbnail,
        "category",
        data.category,
        "classification",
        data.classification,
        "status",
        data.status,
        "statusOrder",
        statusOrderMap[data.status] || 0,
        "totalFund",
        data.totalFund,
        "province",
        convertToCleanedName(data.location?.province),
        "constructionUnit",
        data.metadata?.constructionUnit ?? "N/A"
      );
    });

    await Promise.all(promises);
  }

  console.log("[indexFirestoreDocsToRedis]: Succeeded!");
  process.exit(0);
}
