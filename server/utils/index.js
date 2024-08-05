const { firestore } = require("../firebase");

async function updateClassificationAndCategoryCounts(classification, category, variant) {
  const classificationDoc = await firestore.collection("counts").doc("classification").get();
  const categoryDoc = await firestore.collection("counts").doc("category").get();

  if (classification !== undefined && classificationDoc.exists) {
    const classificationCounts = classificationDoc.data();
    classificationCounts[classification] = (classificationCounts[classification] || 0) + variant;
    await firestore.collection("counts").doc("classification").set(classificationCounts);
  }

  if (category !== undefined && categoryDoc.exists) {
    const categoryCounts = categoryDoc.data();
    categoryCounts[category] = (categoryCounts[category] || 0) + variant;
    await firestore.collection("counts").doc("category").set(categoryCounts);
  }
}

module.exports = { updateClassificationAndCategoryCounts };
