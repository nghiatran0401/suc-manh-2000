const updateFirestoreCountsCollection = require("./updateFirestoreCountsCollection");
const indexFirestoreDocsToRedis = require("./indexFirestoreDocsToRedis");
const countTotalProjects = require("./countTotalProjects");

async function githubWorkflow() {
  await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis(), countTotalProjects()]);
  console.log("[githubWorkflow]: Succeeded!");
}

githubWorkflow();
