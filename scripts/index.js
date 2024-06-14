const slugify = require("slugify");
const { firestore } = require("../server/firebase");

async function updateSlugForAllDocuments() {
  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.hasOwnProperty("slug")) {
        const newSlug = slugify(data.name, { lower: true, strict: true });
        await doc.ref.update({ slug: newSlug });
      }
    }
  }
}

async function updateThumbnailForAllDocuments() {
  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();

      let newThumbnail;
      if (data.content?.tabs?.length > 0 && data.content?.tabs[0]?.slide_show?.length > 0 && data.content?.tabs[0]?.slide_show[0]?.image) {
        newThumbnail = data.content.tabs[0].slide_show[0].image;
      } else if (data.progress?.length > 0 && data.progress[0]?.images?.length > 0 && data.progress[0]?.images[0]?.image) {
        if (data.content?.tabs?.length > 0 && data.content.tabs[0]?.slide_show?.length > 0 && data.content.tabs[0].slide_show[0]?.image) {
          newThumbnail = data.content.tabs[0].slide_show[0].image;
        } else if (data.progress && data.progress.length > 0 && data.progress[0]?.images?.length > 0 && data.progress[0].images[0]?.image) {
          newThumbnail = data.progress[0].images[0].image;
        } else {
          newThumbnail = "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png";
        }
        newThumbnail = data.progress[0].images[0].image;
      } else {
        newThumbnail = "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png";
      }
      await doc.ref.update({ thumbnail: newThumbnail });
    }
  }
}

async function uploadDataToFirestore(file) {
  // Read the data from the file
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  // Iterate over each item in the data
  for (const item of data) {
    // Skip the item if it doesn't have a category
    if (!item.category) {
      console.log(`Skipping item ${item.id}`);
      continue;
    }

    // Upload the item to Firestore
    try {
      await firestore.collection(item.category).doc(item.id).set(item);
      console.log(`Uploaded item ${item.id} to collection ${item.category}`);
    } catch (error) {
      console.error(`Failed to upload item ${item.id}:`, error);
    }
  }
}

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

  // Upload the counts to Firestore
  try {
    await firestore.collection("counts").doc("classification").set(classificationCounts);
    await firestore.collection("counts").doc("category").set(categoryCounts);
    console.log("counts", { classificationCounts, categoryCounts });
    console.log("Updated classification and category counts");
  } catch (error) {
    console.error("Failed to upload counts:", error);
  }
}

// updateSlugForAllDocuments().catch(console.error);
// updateThumbnailForAllDocuments().catch(console.error);
// uploadDataToFirestore("../transformed_pages.json").catch(console.error);
updateClassificationAndCategoryCounts().catch(console.error);
