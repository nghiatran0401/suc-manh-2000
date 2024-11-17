import { firestore } from "../firebase";

export async function updateFirestoreCountsCollection() {
  let classificationCounts: any = {};
  let categoryCounts: any = {};
  let provinceCounts: any = {};

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const documents = await collection.get();
    for (const doc of documents.docs) {
      const data = doc.data();
      const classification: any = data.classification;
      const category: any = data.category;
      const province: any = data.location?.province;

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

    console.log("[updateFirestoreCountsCollection]: Succeeded!");
  } catch (error) {
    console.error("[updateFirestoreCountsCollection]: Failed! - ", error);
  }
}
