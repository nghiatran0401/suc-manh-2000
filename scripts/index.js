const { firestore, bucket } = require("./firebase");
const fs = require("fs");
const path = require("path");
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

// updateSlugForAllDocuments(newsData).catch(console.error);
