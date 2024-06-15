const Redis = require("ioredis");
const { firestore } = require("./firebase");
const {
  INDEX_NAME,
  INDEX_SCHEMA,
  indexingDataforSearch,
  createRedisIndex,
} = require("./services/redis");
// Initialize Redis
const redis = new Redis(process.env.REDIS_URL);
async function indexFirestoreData() {
  // List all collections
  const collections = await firestore.listCollections();
await createRedisIndex(INDEX_NAME, INDEX_SCHEMA);
  for (const collection of collections) {
    const snapshot = await collection.get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      try {
        indexingDataforSearch({...data, name: data.name ?? 'Not named', collection: collection.id, id: doc.id});
        console.log(
          `Completed document ${doc.id} from collection ${collection.id}`
        );
      } catch (error) {
        console.error(
          `Errored document ${doc.id} from collection ${collection.id}`
        );
      }
    });
  }
}

indexFirestoreData()
  .then(() => {
    console.log("Firestore data indexed successfully");
    redis.quit();
  })
  .catch(console.error);
