const { firestore } = require("./firebase");

async function moveDocument(sourceCollectionName, destinationCollectionName, docId) {
  const sourceDocRef = firestore.collection(sourceCollectionName).doc(docId);
  const destinationDocRef = firestore.collection(destinationCollectionName).doc(docId);

  const doc = await sourceDocRef.get();

  if (!doc.exists) {
    console.log(`No document found with id: ${docId}`);
    return;
  }

  const data = doc.data();

  await firestore.runTransaction(async (transaction) => {
    transaction.set(destinationDocRef, data);
    transaction.delete(sourceDocRef);
  });

  console.log(`Moved document with id: ${docId} from ${sourceCollectionName} to ${destinationCollectionName}`);
}
// moveDocument("du-an-2023", "du-an-2022", "14275").catch(console.error);

async function findDocumentsWithoutProjectId(collectionName) {
  try {
    const snapshot = await firestore.collection(collectionName).get();
    const documentsWithoutProjectId = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.hasOwnProperty("projectId")) {
        documentsWithoutProjectId.push({ id: doc.id, data });
      }
    });

    if (documentsWithoutProjectId.length > 0) {
      console.log(`Found ${documentsWithoutProjectId.length}: "${collectionName}":`);
      documentsWithoutProjectId.forEach((doc) => {
        console.log(`Document ID: ${doc.id}, name: ${doc.data.name}`);
      });
    } else {
      console.log(`All documents in collection "${collectionName}" have the "projectId" attribute.`);
    }
  } catch (error) {
    console.error(`Error fetching documents from collection "${collectionName}":`, error);
  }
}

// findDocumentsWithoutProjectId("du-an-2024").catch(console.error);
