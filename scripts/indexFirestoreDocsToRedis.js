const { firestore } = require("./firebase");
const { upsertDocumentToIndex, createSearchIndex } = require("../server/services/redis");

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
