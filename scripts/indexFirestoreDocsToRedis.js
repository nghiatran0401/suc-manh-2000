const { firestore } = require("./firebase");
const { upsertDocumentToIndex, createSearchIndex } = require("../server/services/redis");

const Redis = require("ioredis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function indexFirestoreDocsToRedis(env) {
  const redisEnv = new Redis(env === "prod" ? process.env.REDIS_PROD_URL : process.env.REDIS_LOCAL_URL);
  console.log(`Indexing Firestore data to Redis at ${env === "prod" ? process.env.REDIS_PROD_URL : process.env.REDIS_LOCAL_URL}`);

  try {
    await createSearchIndex(redisEnv);

    const collections = await firestore.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();

      const promises = snapshot.docs.map(async (doc) => {
        const data = {
          ...doc.data(),
          collection_id: collection.id,
          doc_id: doc.id,
        };

        await upsertDocumentToIndex(data, redisEnv);
      });

      await Promise.all(promises);
    }

    console.log("[indexFirestoreDocsToRedis]: Succeeded!");
    redisEnv.disconnect();
  } catch (error) {
    console.error("[indexFirestoreDocsToRedis]: Failed! - ", error.message);
  }
}

// indexFirestoreDocsToRedis("prod");

module.exports = indexFirestoreDocsToRedis;
