const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { addDocumentToIndex } = require("../services/redis");

const indexNewDocument = onDocumentWritten("{collectionId}/{docId}", async (change, context) => {
  const subject = change.subject;
  const [_, collectionId, docId] = subject.split("/");
  const data = change.data.after.data();

  console.log("here", { collectionId, docId, data });

  await addDocumentToIndex({ ...data, collection_id: collectionId, doc_id: docId });
});

module.exports = { indexNewDocument };
