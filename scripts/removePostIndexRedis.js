const { removeSearchIndexAndDocuments } = require("../server/services/redis");


async function removePostIndexData() {
  try {
    await removeSearchIndexAndDocuments();
    return;   
  } catch (error) {
    console.error(`error when remove index`, error);
  }
}

removePostIndexData().catch(console.error);
