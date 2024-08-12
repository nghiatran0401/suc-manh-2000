
const Redis = require("ioredis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function countPosts() {
  const redisInstance = new Redis(process.env.REDIS_PROD_URL || 'redis://localhost:6379');

  try {
    const keys = await redisInstance.keys('post:*');
    console.log(`Total posts: ${keys.length}`);

    redisInstance.disconnect();
  } catch (error) {
    console.error('Error counting posts:', error);
  }
}

countPosts().catch(console.error);
