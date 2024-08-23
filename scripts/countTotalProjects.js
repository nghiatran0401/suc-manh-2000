const { firestore } = require("./firebase");

const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours

async function getValueInRedis(key) {
  try {
    const type = await redis.type(key);
    let value;

    if (type === "string") {
      value = await redis.get(key);
      value = value ? JSON.parse(value) : null;
    } else if (type === "hash") {
      value = await redis.hgetall(key);
    } else {
      value = null;
    }

    return value;
  } catch (error) {
    console.error("Error getting value from Redis:", error.message);
    throw error;
  }
}

async function setExValueInRedis(key, value, exp = false) {
  try {
    if (exp) {
      await redis.set(key, JSON.stringify(value), "EX", DEFAULT_EXPIRATION);
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error setting value in Redis:", error.message);
    throw error;
  }
}

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
