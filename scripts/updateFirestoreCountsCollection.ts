import { firestore } from "./firebase";
import { convertToCleanedName } from "./utils";

async function updateFirestoreCountsCollection() {
  let classificationCounts = {};
  let categoryCounts = {};
  let provinceCounts = {};

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const documents = await collection.get();
    for (const doc of documents.docs) {
      const data = doc.data();
      const classification = data.classification;
      const category = data.category;
      const province = convertToCleanedName(data.location?.province);

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

      if (province) {
        if (!provinceCounts[province]) {
          provinceCounts[province] = 0;
        }
        provinceCounts[province]++;
      }
    }
  }

  try {
    await firestore.collection("counts").doc("classification").set(classificationCounts);
    await firestore.collection("counts").doc("category").set(categoryCounts);
    await firestore.collection("counts").doc("province").set(provinceCounts);

    // console.log("counts", { classificationCounts, categoryCounts, provinceCounts });
    console.log("[updateFirestoreCountsCollection]: Succeeded!");
  } catch (error) {
    console.error("[updateFirestoreCountsCollection]: Failed! - ", error);
  }
}

// updateFirestoreCountsCollection();

export default updateFirestoreCountsCollection;
