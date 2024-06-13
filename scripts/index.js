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

// updateSlugForAllDocuments().catch(console.error);

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

// updateThumbnailForAllDocuments().catch(console.error);
