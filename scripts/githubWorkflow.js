const updateFirestoreCountsCollection = require("./updateFirestoreCountsCollection");
const indexFirestoreDocsToRedis = require("./indexFirestoreDocsToRedis");
const countTotalProjects = require("./countTotalProjects");

(async () => {
  try {
    await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis(), countTotalProjects()]);
  } catch (error) {
    process.exit(1);
  }
  process.exit(0);
})();
