const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { indexingDataforSearch } = require("../services/redis");
const postTriggerToUpdateRedisDb = onDocumentWritten(
  "{collectionId}/{docId}",
  async (change, context) => {
    const subject = change.subject;
      const [_, collectionId, docId] = subject.split("/");
      const data = change.data.after.data()
    console.log({
      collectionId,
      docId,
      data,
    });
    await indexingDataforSearch({ ...data, name: data.name ?? "Not named", collection: collectionId, id: docId });
  }
);

module.exports = { postTriggerToUpdateRedisDb };
