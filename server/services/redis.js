const Redis = require("ioredis");
const { convertToCleanedName } = require("../utils/search");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL);

const INDEX_NAME = "post_index";
const INDEX_SCHEMA = ["SCHEMA", "id", "TEXT", "slug", "TEXT", "name", "TEXT", "cleanedName", "TEXT", "thumbnail", "TEXT", "category", "TEXT", "classification", "TEXT"];
const SEARCH_FIELD = ["name", "cleanedName"];

// https://d128ysc22mu7qe.cloudfront.net/Commands/#ftcreate
async function createSearchIndex() {
  try {
    await redis.call("FT.INFO", INDEX_NAME);
    console.log(`Index '${INDEX_NAME}' already exists`);
  } catch (error) {
    await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
    console.log(`Index '${INDEX_NAME}' created successfully`);
  }
}

async function removeSearchIndexAndDocuments() {
  while (results[0] > 0) {
    console.log(`Deleting ${results[0]} documents`);
    for (let i = 1; i < results.length; i += 2) {
      const docId = results[i];

      await redis.call("FT.DEL", INDEX_NAME, docId);
      console.log(`Document '${docId}' deleted from index '${INDEX_NAME}' successfully`);
    }

    results = await redis.call("FT.SEARCH", INDEX_NAME, "*");
  }
}

// https://d128ysc22mu7qe.cloudfront.net/Commands/#ftadd
async function addDocumentToIndex(data) {
  await redis.call(
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
    data.classification
  );
  // console.log(`Document '${data.doc_id}' added to index '${INDEX_NAME}' successfully`);
}

async function removeDocumentFromIndex(data) {
  await redis.call("FT.DEL", INDEX_NAME, `post:${data.collection_id}:${data.doc_id}`);
  // console.log(`Document '${data.doc_id}' deleted from index '${INDEX_NAME}' successfully`);
}

async function updateDocumentInIndex(data) {
  await redis.call(
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
    data.classification
  );
  // console.log(`Document '${data.doc_id}' updated in index '${INDEX_NAME}' successfully`);
}

// https://medium.com/datadenys/full-text-search-in-redis-using-redisearch-31df0deb4f3e
async function redisSearchByName(searchKey) {
  const results = await redis.call("FT.SEARCH", INDEX_NAME, `(@${SEARCH_FIELD[0]}:${searchKey}*) | (@${SEARCH_FIELD[1]}:${convertToCleanedName(searchKey)}*)`, "SORTBY", "category", "DESC", "LIMIT", 0, 30);
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

async function getValue(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting value from Redis:', error);
    throw error;
  }
}

async function setValue(key, value) {
  try {
    await redis.set(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting value in Redis:', error);
    throw error;
  }
}

module.exports = { 
  redisSearchByName, 
  createSearchIndex, 
  addDocumentToIndex, 
  removeDocumentFromIndex, 
  updateDocumentInIndex, 
  removeSearchIndexAndDocuments,
  getValue,
  setValue,
};
