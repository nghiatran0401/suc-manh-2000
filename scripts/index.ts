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
