const Redis = require("ioredis");
const { modifyNameForSearch } = require("../utils/search");
const redis = new Redis(
  process.env.REDIS_URL
);

const INDEX_NAME = "cleanName";
const INDEX_KEY = "cleanName";
const INDEX_SCHEMA = [
  "SCHEMA",
  "name",
  "TEXT",
  "id",
  "TEXT",
  "thumbnail",
  "TEXT",
  "collection",
  "TEXT",
  `${INDEX_KEY}`,
  "TEXT",
];

const redisSearchByName = async (keyword, limit) => {
  console.log({ keyword , limit })
  const result = await redis.call(
    "FT.SEARCH",
    INDEX_NAME,
    `@${INDEX_KEY}:${keyword}*`,
    "LIMIT",
    0,
    limit ?? 20
  );
  return result;
};

const removeRedisIndex = async (indexName) => {
  try {
    const exists = await redis.exists(indexName);
    if (exists) {
      await redis.call("FT.DROPINDEX", indexName);
      console.log(`Index '${indexName}' dropped successfully`);
    } else {
      console.log(`Index '${indexName}' does not exist`);
    }
  } catch (error) {
    console.error(`Error dropping index '${indexName}':`, error);
  }
};

const indexingDataforSearch = async (data) => {
  await redis.call(
    "FT.ADD",
    INDEX_NAME,
    `doc:${data.collection}:${data.id}`,
    1.0,
    "REPLACE",
    "FIELDS",
    "name",
    data.name,
    "cleanName",
    modifyNameForSearch(data.name),
    "id",
    data.id,
    "collection",
    data.collection,
    "thumbnail",
    data.thumbnail || ""
  );
};

async function createRedisIndex(indexName, schema) {
  try {
    const isExist = await redis.exists(indexName);
    console.log({ isExist });
    if (isExist) {
      await removeRedisIndex(indexName);
    }
    await redis.call(
      "FT.CREATE",
      indexName,
      "ON",
      "HASH",
      "PREFIX",
      '1',
      "doc:",
      ...(schema ?? INDEX_SCHEMA)
    );
    console.log(`Index '${indexName}' created successfully`);
  } catch (error) {
    console.error(`Error creating index '${indexName}':`, error);
  }
}

module.exports = {
  redisSearchByName,
  removeRedisIndex,
  createRedisIndex,
  indexingDataforSearch,
  INDEX_SCHEMA,
  INDEX_NAME,
  INDEX_KEY,
};
