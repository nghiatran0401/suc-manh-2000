import { firestore } from "../firebase";
import { convertToCleanedName } from "../utils/search";

async function updateFirestoreCountsCollection() {
  let classificationCounts: any = {};
  let categoryCounts: any = {};
  let provinceCounts: any = {};
  let metadataCounts: any = {
    totalClassrooms: 0,
    totalPublicAffairsRooms: 0,
    totalRooms: 0,
    totalToilets: 0,
    totalKitchens: 0,
  };

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const documents = await collection.get();
    for (const doc of documents.docs) {
      const data = doc.data();
      const classification = data.classification;
      const category = data.category;
      const province = convertToCleanedName(data.location?.province);
      const metadata = data.metadata;
      const qualified = ["dang-xay-dung", "da-hoan-thanh"].includes(data.status);

      if ((category?.includes("du-an") && qualified) || !category?.includes("du-an")) {
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }
        categoryCounts[category]++;
      }

      if (classification && qualified) {
        if (!classificationCounts[classification]) {
          classificationCounts[classification] = 0;
        }
        classificationCounts[classification]++;
      }

      if (province) {
        if (!provinceCounts[province]) {
          provinceCounts[province] = 0;
        }
        provinceCounts[province]++;
      }

      if (metadata && Object.keys(metadata).length > 0) {
        for (let key in metadataCounts) {
          let totalValue = Number(metadata[key]);
          if (!isNaN(totalValue) && totalValue > 0) {
            metadataCounts[key] += totalValue;
          }
        }
      }
    }
  }

  try {
    await Promise.all([
      firestore.collection("counts").doc("classification").set(classificationCounts),
      firestore.collection("counts").doc("category").set(categoryCounts),
      firestore.collection("counts").doc("province").set(provinceCounts),
      firestore.collection("counts").doc("metadata").set(metadataCounts),
    ]);

    console.log("[updateFirestoreCountsCollection]: Succeeded!");
  } catch (error) {
    console.error("[updateFirestoreCountsCollection]: Failed! - ", error);
  }
}

export default updateFirestoreCountsCollection;
