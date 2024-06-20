const { firestore } = require("./firebase");
const projectsData = require("../transformed_.json");
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

async function updateThumbnailForDuAnCollections() {
  // Get all collections
  const collections = await firestore.listCollections();

  // Filter collections that include "du-an"
  const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));

  for (const collection of duAnCollections) {
    // Get all documents in the collection
    const snapshot = await collection.get();

    // Loop through all documents
    snapshot.forEach(async (doc) => {
      const data = doc.data();

      // Get the progress attribute and find the object where name === "Ảnh hoàn thiện"
      const hoanthienItem = data.progress.find((item) => item.name === "Ảnh hoàn thiện");

      // If the object exists and images.length > 0, update the thumbnail with the first image
      if (
        hoanthienItem &&
        hoanthienItem.images.length > 0 &&
        hoanthienItem.images[0].image !==
          "https://storage.googleapis.com/savvy-serenity-424116-g1.appspot.com/uploads/2021/03/z2408876274799_eedb6d12b1a1453e19823a9753610f82.jpg?GoogleAccessId=savvy-serenity-424116-g1%40appspot.gserviceaccount.com&Expires=16446992400&Signature=oWqiWejy1j6mhsTQ2tThyfb1t7OfqmCz4a3UZtT%2B2p%2BIs5Bdat3pPYSjwv62rjN0ZsmCsBvmqLlizvQR2d54hCz6RTvH2Ez7eg0C6G2grq3KK%2FNx3zfC41TDXYXnTDqempomj1BMl%2FbldhH04S125%2BDNHcEDVFWz9pubLKd%2FhimPdjyWPVOLd3Se8%2BKaczohFPWEhzas3PfIp8nGovA2fFrcvPw3BvpCQhY8fTckUAunbfi%2BTF3KWLOOl8j03TmLcvuUZCWVc0Hq8bpVQUauUNj15v8lsW%2BiSfRBLxwHuM05DTx%2BExjZK9IZQEwHZZO9keH9vfMNSJQ6ia0tqd1HBw%3D%3D"
      ) {
        console.log("here", doc.id);
        await doc.ref.update({ thumbnail: hoanthienItem.images[0].image });
      } else {
        const tiendoItem = data.progress.find((item) => item.name === "Ảnh tiến độ");

        if (
          tiendoItem &&
          tiendoItem.images.length > 0 &&
          tiendoItem.images[0].image !==
            "https://storage.googleapis.com/savvy-serenity-424116-g1.appspot.com/uploads/2021/03/z2408876274799_eedb6d12b1a1453e19823a9753610f82.jpg?GoogleAccessId=savvy-serenity-424116-g1%40appspot.gserviceaccount.com&Expires=16446992400&Signature=oWqiWejy1j6mhsTQ2tThyfb1t7OfqmCz4a3UZtT%2B2p%2BIs5Bdat3pPYSjwv62rjN0ZsmCsBvmqLlizvQR2d54hCz6RTvH2Ez7eg0C6G2grq3KK%2FNx3zfC41TDXYXnTDqempomj1BMl%2FbldhH04S125%2BDNHcEDVFWz9pubLKd%2FhimPdjyWPVOLd3Se8%2BKaczohFPWEhzas3PfIp8nGovA2fFrcvPw3BvpCQhY8fTckUAunbfi%2BTF3KWLOOl8j03TmLcvuUZCWVc0Hq8bpVQUauUNj15v8lsW%2BiSfRBLxwHuM05DTx%2BExjZK9IZQEwHZZO9keH9vfMNSJQ6ia0tqd1HBw%3D%3D"
        ) {
          console.log("here2", doc.id);
          await doc.ref.update({ thumbnail: tiendoItem.images[0].image });
        } else {
          const hientrangItem = data.progress.find((item) => item.name === "Ảnh hiện trạng");

          if (hientrangItem && hientrangItem.images.length > 0) {
            console.log("here3", doc.id);
            await doc.ref.update({ thumbnail: hientrangItem.images[0].image });
          } else {
            console.log("No thumbnail found for", doc.id);
          }
        }
      }
    });
  }
}

updateThumbnailForDuAnCollections().catch(console.error); // updateSlugForAllDocuments(newsData).catch(console.error);
// updateClassificationAndCategoryCounts().catch(console.error);
