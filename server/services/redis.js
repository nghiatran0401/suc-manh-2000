const Redis = require("ioredis");
const { convertToCleanedName, escapeSpecialCharacters } = require("../utils/search");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL);

const INDEX_NAME = "post_index";
const INDEX_SCHEMA = [
  "SCHEMA",
  "id",
  "TEXT",
  "slug",
  "TEXT",
  "name",
  "TEXT",
  "cleanedName",
  "TEXT",
  "publishDate",
  "TEXT",
  "thumbnail",
  "TEXT",
  "category",
  "TAG",
  "classification",
  "TAG",
  "status",
  "TAG",
  "totalFund",
  "NUMERIC",
  "province",
  "TAG",
];
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
      "publishDate",
      data.publish_date?.toDate(),
      "thumbnail",
      data.thumbnail,
      "category",
      data.category,
      "classification",
      data.classification,
      "status",
      data.status,
      "totalFund",
      data.totalFund,
      "province",
      data.location?.province
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

async function redisSearchByName(q, filters) {
  let query = "";
  const args = [];
  args.push("FT.SEARCH");
  args.push(INDEX_NAME);

  if (q) {
    query += `(@name:${q}*) | (@cleanedName:${convertToCleanedName(q)}*)`;
  }

  if (filters.categoryFilter) {
    query += ` @category:{${escapeSpecialCharacters(filters.categoryFilter)}}`;
  }

  if (filters.classificationFilter) {
    query += ` @classification:{${escapeSpecialCharacters(filters.classificationFilter)}}`;
  }

  if (filters.statusFilter) {
    query += ` @status:{${escapeSpecialCharacters(filters.statusFilter)}}`;
  }

  if (filters.totalFundFilter) {
    switch (filters.totalFundFilter) {
      case "less-than-100":
        query += ` @totalFund:[0, 100000000]`;
        break;
      case "100-to-200":
        query += ` @totalFund:[100000000, 200000000]`;
        break;
      case "200-to-300":
        query += ` @totalFund:[200000000, 300000000]`;
        break;
      case "300-to-400":
        query += ` @totalFund:[300000000, 400000000]`;
        break;
      case "more-than-400":
        query += ` @totalFund:[400000000, inf]`;
        break;
      default:
        break;
    }
  }

  if (filters.provinceFilter) {
    query += ` @province:{${escapeSpecialCharacters(filters.provinceFilter)}}`;
  }

  args.push(query);
  args.push("SORTBY", "category", "DESC");
  args.push("LIMIT", 0, 10000); // get all results

  const results = await redis.call(...args);
  const transformedResults = [];
  const totalCount = results[0];

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

async function getValuesByCategoryInRedis(category, filters, start, end) {
  try {
    const pattern = `post:${category}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return [];

    let values = [];
    for (const key of keys) {
      const type = await redis.type(key);
      let value;

      if (type === "string") {
        value = await redis.get(key);
        value = value ? JSON.parse(value) : null;
      } else if (type === "hash") {
        value = await redis.hgetall(key);
      } else {
        continue;
      }

      values.push({ ...value, redisKey: key });
    }
    values.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    if (start !== undefined && end !== undefined) {
      values = values.slice(start, end);
    }

    const getStatsData = (posts) => {
      const STATUSES = ["can-quyen-gop", "dang-xay-dung", "da-hoan-thanh"];
      const statsData = {};

      for (const post of posts) {
        if (statsData[post.classification]) {
          statsData[post.classification].count += 1;
          statsData[post.classification][post.status] += 1;
        } else {
          statsData[post.classification] = {
            count: 1,
            [STATUSES[0]]: 0,
            [STATUSES[1]]: 0,
            [STATUSES[2]]: 0,
          };
          statsData[post.classification][post.status] += 1;
        }
      }

      return statsData;
    };
    const statsData = getStatsData(values);

    if (!filters || Object.keys(filters).length <= 0 || Object.values(filters).every((f) => f === "all")) {
      return { cachedResultData: values, totalValuesLength: values.length, statsData: statsData };
    }

    const getNestedValue = (obj, path) => {
      if (path.includes("location")) {
        return [path].reduce((acc, part) => acc && acc[part], obj);
      } else {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
      }
    };

    const filteredValues = values.filter((item) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key];
        if (filterValue === "all") return true;

        if (key === "totalFund") {
          const totalFund = getNestedValue(item, key);
          switch (filterValue) {
            case "less-than-100":
              return totalFund < 100000000;
            case "100-to-200":
              return totalFund >= 100000000 && totalFund < 200000000;
            case "200-to-300":
              return totalFund >= 200000000 && totalFund < 300000000;
            case "300-to-400":
              return totalFund >= 300000000 && totalFund < 400000000;
            case "more-than-400":
              return totalFund >= 400000000;
            default:
              return true;
          }
        }

        const itemValue = getNestedValue(item, key);
        return itemValue === filterValue;
      });
    });

    return { cachedResultData: filteredValues, totalValuesLength: values.length, statsData: statsData };
  } catch (error) {
    console.error("Error getting values from Redis:", error.message);
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
  getValuesByCategoryInRedis,
  setExValueInRedis,
  delValueInRedis,
};
