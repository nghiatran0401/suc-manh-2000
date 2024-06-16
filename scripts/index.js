const { firestore } = require("../server/firebase");
const fs = require("fs").promises;
const projectsData = require("../transformed_pages.json");
const newsData = require("../transformed_posts.json");

async function updateSlugForAllDocuments(original_data) {
  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.hasOwnProperty("slug")) {
        const d = original_data.find((project) => String(project.id) === String(doc.id));
        if (d) {
          const newSlug = d.slug;
          console.log("Updating slug for", doc.id, "from", data.slug, "to", newSlug);
          await doc.ref.update({ slug: newSlug });
        }
      }
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

async function getTotalFundForAllProjects() {
  const collections = await firestore.listCollections();
  let totalFunds = {};

  for (const collection of collections) {
    if (!collection.id.includes("du-an")) continue;

    console.log("Doing collection", collection.id);
    const snapshot = await collection.get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let docFunds = {};

      const descriptions = {
        description: data.description,
        "donor.description": data.donor?.description,
        "content.tabs.description": data.content?.tabs?.find((tab) => tab.name === "Nhà hảo tâm")?.description,
      };

      for (const [key, description] of Object.entries(descriptions)) {
        if (description) {
          const match = description.match(/\d+000000|\d+(?:\.\d{3})*\.000\.000|\d+(?:,\d{3})*,000,000/g);
          docFunds[key] = match ? match[0] : null;
        } else {
          docFunds[key] = null;
        }
      }

      totalFunds[data.id] = docFunds;
    }
  }

  await fs.writeFile("totalFunds.json", JSON.stringify(totalFunds, null, 2));
  return totalFunds;
}

async function replaceDescription() {
  // Get all collections
  const collections = await firestore.listCollections();

  // Filter collections that include 'du-an'
  const projectCollections = collections.filter((collection) => collection.id.includes("du-an"));

  for (const collection of projectCollections) {
    // Get all documents in the collection
    const snapshot = await firestore.collection(collection.id).get();

    snapshot.forEach(async (doc) => {
      // Get the document data
      let data = doc.data();

      // Check and replace the 'description' attribute
      if (data.description && typeof data.description === "string") {
        data.description = data.description.replace(/\n\n\n/g, "");
      }

      // Check and replace the 'donor.description' attribute
      if (data.donor && data.donor.description && typeof data.donor.description === "string") {
        data.donor.description = data.donor.description.replace(/\n\n\n/g, "");
      }

      // Check and replace the 'content.tabs.description' attribute
      if (data.content && data.content.tabs) {
        data.content.tabs = data.content.tabs.map((tab) => {
          if (tab.description && typeof tab.description === "string") {
            tab.description = tab.description.replace(/\n\n\n/g, "");
          }
          return tab;
        });
      }

      // Update the document with the new data
      await firestore.collection(collection.id).doc(doc.id).set(data);
    });
  }
}

replaceDescription().catch(console.error);

// getTotalFundForAllProjects().then((totalFunds) => console.log("Done!"));
// updateSlugForAllDocuments(newsData).catch(console.error);
// updateClassificationAndCategoryCounts().catch(console.error);
