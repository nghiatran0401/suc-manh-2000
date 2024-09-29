const { firestore } = require("./firebase");
const { convertToCleanedName } = require("../server/utils/search");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Redis = require("ioredis");
const { removeSearchIndexAndDocuments } = require("../server/services/redis");
const redis = new Redis(process.env.REDIS_PROD_URL);

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
  "publishDate",
  "TEXT",
  "thumbnail",
  "TEXT",
  "category",
  "TAG",
  "classification",
  "TAG",
  "status",
  "TAG",
  "totalFund",
  "NUMERIC",
  "province",
  "TAG",
];

async function createIndexAndDocuments() {
  await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();

    const promises = snapshot.docs.map(async (doc) => {
      const data = {
        ...doc.data(),
        collection_id: collection.id,
        doc_id: doc.id,
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
        "publishDate",
        data.publish_date?.toDate(),
        "thumbnail",
        data.thumbnailNew ? data.thumbnailNew : data.thumbnail,
        "category",
        data.category,
        "classification",
        data.classification,
        "status",
        data.status,
        "totalFund",
        data.totalFund,
        "province",
        data.location?.province
      );
    });

    await Promise.all(promises);
  }

  console.log("[indexFirestoreDocsToRedis]: Succeeded!");
  process.exit(0);
}

async function indexFirestoreDocsToRedis() {
  try {
    // if index exists, remove it and create new
    await redis.call("FT.INFO", INDEX_NAME);
    await removeSearchIndexAndDocuments();
    await createIndexAndDocuments();
  } catch (error) {
    // if index does not exist, create new
    await createIndexAndDocuments();
  }
}

// indexFirestoreDocsToRedis();

module.exports = indexFirestoreDocsToRedis;
