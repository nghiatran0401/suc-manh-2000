// const { onDocumentWritten } = require("firebase-functions/v2/firestore");
// const { addDocumentToIndex } = require("../services/redis");

// const indexNewDocumentToRedis = onDocumentWritten("{collectionId}/{docId}", async (snap, context) => {
//   console.log("here", { change, context });

//   const data = snap.data();
//   const { collectionId, docId } = context.params;

//   console.log("here", { collectionId, docId, data });
//   // const subject = snap.subject;
//   // const [_, collectionId, docId] = subject.split("/");
//   // const data = snap.data.after.data();

//   await addDocumentToIndex({ ...data, collection_id: collectionId, doc_id: docId });
// });

// module.exports = { indexNewDocumentToRedis };
