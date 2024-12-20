import { firestore } from "./firebase";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "");

const INDEX_NAME = "donor_index";
const INDEX_SCHEMA = [
  "SCHEMA",
  "id",
  "TEXT",
  "name",
  "TEXT",
  "intro",
  "TEXT",
  "logo",
  "TEXT",
  "type",
  "TEXT",
  "employeeCount",
  "TEXT",
  "totalProjects",
  "TEXT",
];

async function indexDonorsDocsToRedis() {
  const currentIndexes = await redis.call('FT._LIST');
  const existedIndex = (currentIndexes as string).includes(INDEX_NAME);
  if (existedIndex) {
    await redis.call('FT.DROPINDEX', INDEX_NAME);
  }
  await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "donor", ...INDEX_SCHEMA);

  const collections = await firestore.listCollections();
  for (const collection of collections) {
    if (['donors'].includes(collection.id)) {
      const snapshot = await collection.get();

      await Promise.all(snapshot.docs.map(async (doc) => {
        const data: any = {
          ...doc.data(),
          collection_id: collection.id,
          doc_id: doc.id,
        };

        await redis.call(
          "FT.ADD",
          INDEX_NAME,
          `donor:${data.doc_id}`,
          1.0,
          "REPLACE",
          "FIELDS",
          "id",
          data.doc_id,
          1.0,
          "FIELDS",
          "id",
          data.doc_id,
          "name",
          data.name,
          "intro",
          data.intro,
          "logo",
          data.logo,
          "type",
          data.type,
          "employeeCount",
          data.employeeCount,
          "totalProjects",
          JSON.stringify(data.totalProjects),
        )
      }));
    }
  }
}

// indexDonorsDocsToRedis().then(() => {
//   console.log("Done");
//   process.exit(0);
// });

export default indexDonorsDocsToRedis;