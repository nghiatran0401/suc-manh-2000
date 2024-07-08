const Redis = require("ioredis");
require("dotenv").config();

// Create Redis clients
const redisProdClient = new Redis(process.env.REDIS_PROD_URL);
const redisLocalClient = new Redis(process.env.REDIS_LOCAL_URL);

// Migrate data
async function migrateRedisProdToLocal() {
  try {
    const keys = await redisProdClient.keys("*");
    console.log(`Found ${keys.length} keys in production Redis`);

    for (const key of keys) {
      const type = await redisProdClient.type(key);

      switch (type) {
        case "string":
          const stringValue = await redisProdClient.get(key);
          await redisLocalClient.set(key, stringValue);
          break;

        case "list":
          const listValues = await redisProdClient.lrange(key, 0, -1);
          await redisLocalClient.del(key);
          await redisLocalClient.rpush(key, ...listValues);
          break;

        case "set":
          const setValues = await redisProdClient.smembers(key);
          await redisLocalClient.del(key);
          await redisLocalClient.sadd(key, ...setValues);
          break;

        case "hash":
          const hashValues = await redisProdClient.hgetall(key);
          await redisLocalClient.del(key);
          await redisLocalClient.hmset(key, hashValues);
          break;

        case "zset":
          const zsetValues = await redisProdClient.zrange(key, 0, -1, "WITHSCORES");
          await redisLocalClient.del(key);
          for (let i = 0; i < zsetValues.length; i += 2) {
            await redisLocalClient.zadd(key, zsetValues[i + 1], zsetValues[i]);
          }
          break;

        default:
          console.log(`Skipping unsupported type: ${type} for key: ${key}`);
          break;
      }

      console.log(`Migrated key ${key} of type ${type}`);
    }

    console.log("Data migration complete");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    redisProdClient.disconnect();
    redisLocalClient.disconnect();
  }
}

migrateRedisProdToLocal().catch(console.error);
