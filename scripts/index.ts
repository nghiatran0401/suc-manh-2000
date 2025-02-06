import { firestore } from "./firebase";

const fetchDocumentWithMetadata = async () => {
  const collections = await firestore.listCollections();
  const projectCollections = collections.filter((collection) => !collection.id.includes("du-an"));

  for (let i = 0; i < projectCollections.length; i++) {
    const collection = projectCollections[i];
    const querySnapshot = await collection.get();

    if (!querySnapshot.empty) {
      for (let j = 0; j < querySnapshot.docs.length; j++) {
        const doc = querySnapshot.docs[j];
        const createTime = doc.createTime;
        const updateTime = doc.updateTime;

        await doc.ref.update({
          createdAt: createTime,
          updatedAt: updateTime,
          // start_date: firebase.firestore.FieldValue.delete(),
          // end_date: firebase.firestore.FieldValue.delete(),
          // publish_date: firebase.firestore.FieldValue.delete(),
        });

        console.log("Updated", doc.id, collection.id);
      }
    } else {
      console.log("No documents found in collection:", collection.id);
    }
  }
};
// fetchDocumentWithMetadata();

async function calculateTotals() {
  const collections = await firestore.listCollections();
  const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));

  const totals = {
    totalClassrooms: 0,
    totalPublicAffairsRooms: 0,
    totalRooms: 0,
    totalToilets: 0,
    totalKitchens: 0,
  };

  for (const collection of duAnCollections) {
    const snapshot = await collection.get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.metadata) {
        const { totalClassrooms, totalPublicAffairsRooms, totalRooms, totalToilets, totalKitchens } = data.metadata;

        totals.totalClassrooms += Number(totalClassrooms) || 0;
        totals.totalPublicAffairsRooms += Number(totalPublicAffairsRooms) || 0;
        totals.totalRooms += Number(totalRooms) || 0;
        totals.totalToilets += Number(totalToilets) || 0;
        totals.totalKitchens += Number(totalKitchens) || 0;
      }
    });
  }

  console.log("Totals:", totals);
  const countsCollection = firestore.collection("counts");
  await countsCollection.doc("metadata").set(totals);
}
// calculateTotals().catch(console.error);
