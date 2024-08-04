const Redis = require("ioredis");
const { convertToCleanedName } = require("../utils/search");
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
  "location.province",
  "TAG",
];
const SEARCH_FIELD = ["name", "cleanedName", "category", "classification", "status", "totalFund", "location.province"];
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
      data.classification ?? null,
      "status",
      data.status ?? null,
      "totalFund",
      data.totalFund ?? null,
      "location.province",
      data.location?.province ?? null
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

function escapeSpecialCharacters(str) {
  return str.replace(/[-_]/g, "\\$&");
}

async function redisSearchByName(searchKey, filters, start, end) {
  let query = "";
  const args = [INDEX_NAME];

  if (searchKey) {
    query += `(@${SEARCH_FIELD[0]}:${searchKey}*) | (@${SEARCH_FIELD[1]}:${convertToCleanedName(searchKey)}*)`;
  }

  // if (filters.year) {
  //   query += ` @${SEARCH_FIELD[2]}:${filters.year}`;
  // }

  // if (filters.status) {
  //   query += ` @${SEARCH_FIELD[3]}:{${filters.status}}`;
  // }

  if (filters.classification) {
    query += ` @classification:{${escapeSpecialCharacters("khu-noi-tru")}}`;
  }

  console.log("here", { redisSearchByName, query });

  // if (filters.totalFund) {
  //   query += ` @${SEARCH_FIELD[5]}:[${filters.totalFund.min}, ${filters.totalFund.max}]`;
  // }

  args.push(query);

  // Handle sorting
  args.push("SORTBY", "category", "DESC");

  // Handle limit
  args.push("LIMIT", 0, 30);
  // args.push("LIMIT", start, end - start);
  console.log("here2", { q: "FT.SEARCH", ...args });

  const results = await redis.call("FT.SEARCH", ...args);
  const transformedResults = [];
  const totalCount = results[0];
  console.log("here3", totalCount);

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

async function getValuesByCategoryInRedis(category, filters) {
  try {
    const pattern = `post:${category}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return [];

    const values = [];
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
