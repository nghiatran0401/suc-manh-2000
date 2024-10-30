import { firestore } from "./firebase";
import axios from "axios";
import slugify from "slugify";

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

async function updateImageUrlWithToken(image: string) {
  const uploadsIndex = image.indexOf("/uploads");
  if (uploadsIndex !== -1) {
    try {
      const response = await axios.get(image, { params: { alt: "json" } });
      const metadata = response.data;

      if (metadata.downloadTokens) {
        return `${image}?alt=media&token=${metadata.downloadTokens}`;
      } else {
        console.error(`No download token found for file`);
        return image;
      }
    } catch (error) {
      console.error(`Failed to retrieve metadata for file`);
      return image;
    }
  }
}
const updateThumbnails = async () => {
  const projectCollections = await firestore.listCollections();
  const collections = projectCollections.filter((collection) => collection.id.includes("du-an"));

  for (const collection of collections) {
    const querySnapshot = await collection.get();

    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.donor?.images?.length > 0) {
          // Use Promise.all to resolve all promises returned by the map function
          const updatedImages = await Promise.all(
            data.donor.images.map(async (imageObj: any) => {
              if (typeof imageObj.image === "string" && imageObj.image.includes("%2F")) {
                const updatedImage = await updateImageUrlWithToken(imageObj.image);
                imageObj.image = updatedImage;
              }
              return imageObj;
            })
          );
          await doc.ref.update({ donor: { ...data.donor, images: updatedImages } });
          console.log("Updated:", collection.id, data.projectId);
        }
      }
    }
  }
};
// updateThumbnails();

async function updateSlugsInCollection() {
  const collectionRef = firestore.collection("du-an-2020");
  const querySnapshot = await collectionRef.get();

  if (!querySnapshot.empty) {
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const docData = doc.data();
      if (docData.projectId) {
        const newSlug = slugify(docData.projectId, { lower: true, strict: true });
        await doc.ref.update({ slug: newSlug });
        console.log(`Updated slug for document ID: ${doc.id} to ${newSlug}`);
      } else {
        console.warn(`Document ID: ${doc.id} does not have a projectId`);
      }
    });

    await Promise.all(updatePromises);
  } else {
    console.log("No documents found in collection: du-an-2023");
  }
}
// updateSlugsInCollection();
