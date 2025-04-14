import updateFirestoreCountsCollection from "./updateFirestoreCountsCollection";
import indexFirestoreDocsToRedis from "./indexFirestoreDocsToRedis";

async function githubWorkflow() {
  try {
    await Promise.all([updateFirestoreCountsCollection(), indexFirestoreDocsToRedis()]);
    process.exit(0);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

// githubWorkflow();

export default githubWorkflow;
