const { firestore } = require("./firebase");
const { addDocumentToIndex, createSearchIndex } = require("../server/services/redis");

async function indexFirestoreData() {
  const collections = await firestore.listCollections();
  await createSearchIndex();

  for (const collection of collections) {
    const snapshot = await collection.get();

    const promises = snapshot.docs.map(async (doc) => {
      await addDocumentToIndex({ ...doc.data(), collection_id: collection.id, doc_id: doc.id });
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error indexing Firestore data:`, error.message);
    }
  }
}

indexFirestoreData().catch(console.error);
