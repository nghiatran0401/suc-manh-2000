const updateFirestoreCountsCollection = require("./updateFirestoreCountsCollection");
const indexFirestoreDocsToRedis = require("./indexFirestoreDocsToRedis");
const countTotalProjects = require("./countTotalProjects");

(async () => {
  try {
    await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis(), countTotalProjects()]);
    console.log("[githubWorkflow]: Succeeded!");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
  process.exit(0);
})();
