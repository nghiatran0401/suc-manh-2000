const { firestore } = require("./firebase");
const { INDEX_NAME, upsertDocumentToIndex, createSearchIndex, removeSearchIndexAndDocuments } = require("../server/services/redis");

//  *** ASK NGHIA BEFORE RUNNING THIS SCRIPT ***

// Create Redis clients
const Redis = require("ioredis");
require("dotenv").config();
const redisProdClient = new Redis(process.env.REDIS_PROD_URL);
const redisLocalClient = new Redis(process.env.REDIS_LOCAL_URL);

async function indexFirestoreDocsToRedis() {
  try {
    const redisEnv = redisProdClient;
    console.log(`Indexing Firestore data to Redis at ${process.env.REDIS_LOCAL_URL}`);

    await createSearchIndex(redisEnv);

    const collections = await firestore.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();

      const promises = snapshot.docs.map(async (doc) => await upsertDocumentToIndex({ ...doc.data(), collection_id: collection.id, doc_id: doc.id }, redisEnv));

      await Promise.all(promises);
      console.log(`Indexed ${snapshot.docs.length} documents from collection '${collection.id}'`);
    }
  } catch (error) {
    console.error(`Error indexing Firestore data:`, error.message);
  } finally {
    redisEnv.disconnect();
  }
}

indexFirestoreDocsToRedis().catch(console.error);
