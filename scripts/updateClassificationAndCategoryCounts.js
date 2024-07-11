const { firestore } = require("./firebase");

async function updateClassificationAndCategoryCounts() {
  let classificationCounts = {};
  let categoryCounts = {};

  // Get all collections
  const collections = await firestore.listCollections();

  // Iterate over each collection
  for (const collection of collections) {
    // Get all documents in the collection
    const documents = await collection.get();

    // Iterate over each document
    for (const doc of documents.docs) {
      const data = doc.data();
      const classification = data.classification;
      const category = data.category;

      if (classification) {
        if (!classificationCounts[classification]) {
          classificationCounts[classification] = 0;
        }
        classificationCounts[classification]++;
      }

      if (category) {
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }
        categoryCounts[category]++;
      }
    }
  }

  console.log("counts", { classificationCounts, categoryCounts });

  // Upload the counts to Firestore
  try {
    await firestore.collection("counts").doc("classification").set(classificationCounts);
    await firestore.collection("counts").doc("category").set(categoryCounts);
    console.log("Updated classification and category counts");
  } catch (error) {
    console.error("Failed to upload counts:", error);
  }
}

updateClassificationAndCategoryCounts().catch(console.error);
