import { firestore, firebase } from "./firebase";

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

const updateThumbnails = async () => {
  const collections = await firestore.listCollections();

  for (const collection of collections) {
    const querySnapshot = await collection.get();

    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.thumbnail && typeof data.thumbnail === "string" && data.thumbnail.includes("?GoogleAccessId")) {
          const updatedThumbnail = data.thumbnail.split("?GoogleAccessId")[0];
          await doc.ref.update({ thumbnail: updatedThumbnail });
          console.log(`Updated document ${doc.id} in collection ${collection.id}`);
        }
      }
    }
  }
};

// Call the function
updateThumbnails();
