const fs = require("fs");
const { firestore, firebase } = require("../server/firebase");

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
// uploadDataToFirestore("../transformed_pages.json").catch(console.error);

async function uploadClassificationAndCategoryCounts(file) {
  // Read the data from the file
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  let classificationCounts = {};
  let categoryCounts = {};

  // Iterate over each item in the data
  for (const item of data) {
    const classification = item.classification;
    const category = item.category;

    if (classification) {
      if (!classificationCounts[classification]) {
        classificationCounts[classification] = 0;
      }
      classificationCounts[classification]++;
      if (classification !== "loai-khac") {
        classificationCounts.total = (classificationCounts.total || 0) + 1;
      }
    }

    if (category) {
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;
    }
  }

  // Upload the counts to Firestore
  try {
    await firestore.collection("counts").doc("classification").set(classificationCounts);
    await firestore.collection("counts").doc("category").set(categoryCounts);
    console.log("Uploaded classification and category counts");
  } catch (error) {
    console.error("Failed to upload counts:", error);
  }
}

// uploadClassificationAndCategoryCounts("transformed_pages.json").catch(console.error);

async function updatePublishDateToTimestamp() {
  const collections = await firestore.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (data.publish_date) {
        const publishDateTimestamp = firebase.firestore.Timestamp.fromDate(new Date(data.publish_date));

        try {
          await doc.ref.update({ publish_date: publishDateTimestamp });
          console.log(`Updated publish_date for document ${doc.id} in collection ${collection.id}`);
        } catch (error) {
          console.error(`Failed to update publish_date for document ${doc.id}:`, error);
        }
      }
    }
  }
}

// updatePublishDateToTimestamp().catch(console.error);
