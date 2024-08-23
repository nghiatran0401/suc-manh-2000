const { firestore } = require("./firebase");

const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_PROD_URL);

console.log("here", process.env.REDIS_PROD_URL);

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

async function removeSearchIndexAndDocuments() {
  try {
    let results = await redis.call("FT.SEARCH", INDEX_NAME, "*");
    while (results[0] > 0) {
      for (let i = 1; i < results.length; i += 2) {
        const docId = results[i];

        await redis.call("FT.DEL", INDEX_NAME, docId);
      }

      results = await redis.call("FT.SEARCH", INDEX_NAME, "*");
    }
    await redis.call("FT.DROPINDEX", INDEX_NAME);
  } catch (error) {
    console.error(`Error deleting index '${INDEX_NAME}':`, error.message);
  }
}

async function createSearchIndex() {
  try {
    await removeSearchIndexAndDocuments(redis);
    await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
  } catch (error) {
    await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
  }
}

async function upsertDocumentToIndex(data) {
  try {
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
      data.thumbnail,
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
    console.log(`Document '${data.doc_id}' added to index '${INDEX_NAME}' successfully`);
  } catch (error) {
    console.error(`Error adding document '${data.doc_id}' to index '${INDEX_NAME}':`, error.message);
  }
}

async function indexFirestoreDocsToRedis() {
  try {
    await createSearchIndex();

    const collections = await firestore.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();

      const promises = snapshot.docs.map(async (doc) => {
        const data = {
          ...doc.data(),
          collection_id: collection.id,
          doc_id: doc.id,
        };

        await upsertDocumentToIndex(data);
      });

      await Promise.all(promises);
    }

    console.log("[indexFirestoreDocsToRedis]: Succeeded!");
  } catch (error) {
    console.error("[indexFirestoreDocsToRedis]: Failed! - ", error.message);
  }
}

// indexFirestoreDocsToRedis();

module.exports = indexFirestoreDocsToRedis;
