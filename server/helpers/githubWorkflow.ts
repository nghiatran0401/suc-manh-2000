import updateFirestoreCountsCollection from "./updateFirestoreCountsCollection";
import indexFirestoreDocsToRedis from "./indexFirestoreDocsToRedis";

async function githubWorkflow() {
  try {
    await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis()]);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

githubWorkflow();
