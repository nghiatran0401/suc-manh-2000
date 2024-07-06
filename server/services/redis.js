const Redis = require("ioredis");
const { convertToCleanedName } = require("../utils/search");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL);

const INDEX_NAME = "post_index";
const INDEX_SCHEMA = ["SCHEMA", "id", "TEXT", "slug", "TEXT", "name", "TEXT", "cleanedName", "TEXT", "thumbnail", "TEXT", "category", "TEXT", "classification", "TEXT", "status", "TEXT", "totalFund", "NUMERIC"];
const SEARCH_FIELD = ["name", "cleanedName"];
const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours

async function createSearchIndex(redisEnv = redis) {
  try {
    await redisEnv.call("FT.INFO", INDEX_NAME);
    console.log(`Index '${INDEX_NAME}' already exists`);

    await removeSearchIndexAndDocuments(redisEnv);

    await redisEnv.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
    console.log(`Index '${INDEX_NAME}' created successfully`);
  } catch (error) {
    await redisEnv.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
    console.log(`Index '${INDEX_NAME}' created successfully`);
  }
}

async function removeSearchIndexAndDocuments(redisEnv = redis) {
  try {
    let results = await redisEnv.call("FT.SEARCH", INDEX_NAME, "*");
    while (results[0] > 0) {
      for (let i = 1; i < results.length; i += 2) {
        const docId = results[i];

        await redisEnv.call("FT.DEL", INDEX_NAME, docId);
        console.log(`Document '${docId}' deleted from index '${INDEX_NAME}' successfully`);
      }

      results = await redisEnv.call("FT.SEARCH", INDEX_NAME, "*");
    }

    await redisEnv.call("FT.DROPINDEX", INDEX_NAME);
    console.log(`Index '${INDEX_NAME}' deleted successfully`);
  } catch (error) {
    console.error(`Error deleting index '${INDEX_NAME}':`, error.message);
  }
}

async function upsertDocumentToIndex(data, redisEnv = redis) {
  try {
    await redisEnv.call(
      "FT.ADD",
      INDEX_NAME,
      `post:${data.collection_id}:${data.doc_id}`,
      1.0,
      "REPLACE",
      "FIELDS",
      "id",
      data.id,
      "slug",
      data.slug,
      "name",
      data.name,
      "cleanedName",
      convertToCleanedName(data.name),
      "thumbnail",
      data.thumbnail,
      "category",
      data.category,
      "classification",
      data.classification,
      "status",
      data.status,
      "totalFund",
      data.totalFund
    );
    console.log(`Document '${data.doc_id}' added to index '${INDEX_NAME}' successfully`);
  } catch (error) {
    console.error(`Error adding document '${data.doc_id}' to index '${INDEX_NAME}':`, error.message);
  }
}

async function removeDocumentFromIndex(data) {
  await redis.call("FT.DEL", INDEX_NAME, `post:${data.collection_id}:${data.doc_id}`);
  console.log(`Document '${data.doc_id}' deleted from index '${INDEX_NAME}' successfully`);
}

// https://medium.com/datadenys/full-text-search-in-redis-using-redisearch-31df0deb4f3e
async function redisSearchByName(searchKey, filters) {
  const query = `(@${SEARCH_FIELD[0]}:${searchKey}*) | (@${SEARCH_FIELD[1]}:${convertToCleanedName(searchKey)}*)`;
  const args = [query];

  if (filters.year) {
    args.push('FILTER', 'year', filters.year);
  }

  if (filters.classification) {
    args.push('FILTER', 'year', filters.year);
  }

  if (filters.status) {
    args.push('FILTER', 'classification', filters.classification);
  }

  if (filters.totalFunds) {
    args.push('FILTER', 'totalFunds', filters.totalFunds.min, filters.totalFunds.max);
  }

  const results = await redis.call(
    "FT.SEARCH", INDEX_NAME, 
    ...args,
    "SORTBY", "category", "DESC", "LIMIT", 0, 30);
  const transformedResults = [];
  // const totalCount = results[0];

  for (let i = 1; i < results.length; i += 2) {
    const redisKey = results[i];
    const fields = results[i + 1];
    const obj = { redisKey };

    for (let j = 0; j < fields.length; j += 2) {
      const key = fields[j];
      const value = fields[j + 1];
      obj[key] = value;
    }

    transformedResults.push(obj);
  }

  return transformedResults;
}

async function getValueInRedis(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting value from Redis:", error.message);
    throw error;
  }
}

async function setExValueInRedis(key, value) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", DEFAULT_EXPIRATION);
  } catch (error) {
    console.error("Error setting value in Redis:", error.message);
    throw error;
  }
}

async function delValueInRedis(key) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error deleting value from Redis:", error.message);
    throw error;
  }
}

module.exports = {
  INDEX_NAME,
  INDEX_SCHEMA,
  redisSearchByName,
  createSearchIndex,
  removeSearchIndexAndDocuments,
  upsertDocumentToIndex,
  removeDocumentFromIndex,
  getValueInRedis,
  setExValueInRedis,
  delValueInRedis,
};
