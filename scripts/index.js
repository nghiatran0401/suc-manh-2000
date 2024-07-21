const { firestore, bucket } = require("./firebase");
const fs = require("fs");
const path = require("path");
const projectsData = require("../transformed_pages.json");
const newsData = require("../transformed_posts.json");

async function updateSlugForAllDocuments(original_data) {
  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.hasOwnProperty("slug")) {
        const d = original_data.find((project) => String(project.id) === String(doc.id));
        if (d) {
          const newSlug = d.slug;
          console.log("Updating slug for", doc.id, "from", data.slug, "to", newSlug);
          await doc.ref.update({ slug: newSlug });
        }
      }
    }
  }
}

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

// updateSlugForAllDocuments(newsData).catch(console.error);
moveDocument("du-an-2023", "du-an-2022", "14275").catch(console.error);
