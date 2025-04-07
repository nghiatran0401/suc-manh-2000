import { firestore } from "../firebase";
import { flushAllDataInRedis, upsertDocumentToIndex } from "../services/redis";

async function indexFirestoreDocsToRedis() {
  await flushAllDataInRedis();

  try {
    const collections = await firestore.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();
      const promises = snapshot.docs.map(async (doc) => {
        const data: any = {
          ...doc.data(),
          collection_id: collection.id,
          doc_id: doc.id,
        };
        return await upsertDocumentToIndex(data);
      });
      await Promise.all(promises);
    }

    console.log("[indexFirestoreDocsToRedis]: Succeeded!");
    process.exit(0);
  } catch (err) {
    console.error("[indexFirestoreDocsToRedis]: Failed!", err);
    process.exit(1);
  }
}

export default indexFirestoreDocsToRedis;
