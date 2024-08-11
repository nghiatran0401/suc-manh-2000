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
