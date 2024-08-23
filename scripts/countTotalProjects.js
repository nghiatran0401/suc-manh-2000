const { getValueInRedis, setExValueInRedis } = require("../server/services/redis");
const { firestore } = require("./firebase");

// Total projects = tổng dự án đã khởi công (đã hoàn thành và đang xây dựng)
async function countTotalProjects() {
  try {
    // Lấy data tổng dự án đã khởi công (đã hoàn thành và đang xây dựng) - Firestore
    const collections = await firestore.listCollections();
    const duAnCollections = collections.filter((collection) => collection.id.includes("du-an"));
    const counts = await Promise.all(
      duAnCollections.map(async (collection) => {
        const snapshot = await collection.where("status", "!=", "can-quyen-gop").get();
        return snapshot.size;
      })
    );
    const resultData = counts.reduce((a, b) => a + b, 0);

    // Lấy data tổng dự án đã khởi công (đã hoàn thành và đang xây dựng) - Redis
    const cachedKey = `totalProjectsCount`;
    const cachedResultData = await getValueInRedis(cachedKey);

    // Compare counts data between Firestore and Redis
    if (cachedResultData && Number(cachedResultData) === Number(resultData)) {
      console.log("[countTotalProjects]: Succeeded (1)!");
      return;
    }

    // Update data to Redis
    await setExValueInRedis(cachedKey, resultData, true);
    console.log("[countTotalProjects]: Succeeded (2)!");
  } catch (error) {
    console.error("[countTotalProjects]: Failed! - ", error);
  }
}

// countTotalProjects();

module.exports = countTotalProjects;
