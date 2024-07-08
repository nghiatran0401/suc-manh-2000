const { result } = require("lodash");
const { firestore } = require("../firebase");

function convertToDate(prop) {
  if (prop) {
    return prop.toDate();
  }
}

async function updateClassificationAndCategoryCounts(classification, category, variant) {
  const classificationDoc = await firestore.collection("counts").doc("classification").get();
  const categoryDoc = await firestore.collection("counts").doc("category").get();
  const resultData = {};

  if (classificationDoc.exists) {
    const classificationCounts = classificationDoc.data();
    classificationCounts[classification] = (classificationCounts[classification] || 0) + variant;
    await firestore.collection("counts").doc("classification").set(classificationCounts);
    resultData.classification = classificationCounts;
  }

  if (categoryDoc.exists) {
    const categoryCounts = categoryDoc.data();
    categoryCounts[category] = (categoryCounts[category] || 0) + variant;
    await firestore.collection("counts").doc("category").set(categoryCounts);
    resultData.category = categoryCounts;
  }

  return resultData;
}

module.exports = { convertToDate, updateClassificationAndCategoryCounts };
