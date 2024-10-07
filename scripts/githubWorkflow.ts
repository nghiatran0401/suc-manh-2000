import updateFirestoreCountsCollection from "./updateFirestoreCountsCollection";
import indexFirestoreDocsToRedis from "./indexFirestoreDocsToRedis";

(async () => {
  try {
    await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis()]);
  } catch (error) {
    process.exit(1);
  }
  process.exit(0);
})();
