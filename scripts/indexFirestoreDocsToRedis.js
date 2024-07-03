const { firestore } = require("./firebase");
const { upsertDocumentToIndex, createSearchIndex, removeSearchIndexAndDocuments } = require("../server/services/redis");

// ASK NGHIA BEFORE RUNNING THIS SCRIPT

async function indexFirestoreData() {
  // await removeSearchIndexAndDocuments();
  // return;

  await createSearchIndex();

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();

    const promises = snapshot.docs.map(async (doc) => {
      await upsertDocumentToIndex({ ...doc.data(), collection_id: collection.id, doc_id: doc.id });
    });

    try {
      await Promise.all(promises);
      console.log(`Indexed ${snapshot.docs.length} documents from collection '${collection.id}'`);
    } catch (error) {
      console.error(`Error indexing Firestore data:`, error.message);
    }
  }
}

indexFirestoreData().catch(console.error);
