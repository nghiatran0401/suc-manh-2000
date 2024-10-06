import path from "path";
import dotenv from "dotenv";
import { convertToCleanedName, escapeSpecialCharacters } from "../utils/search";
import Redis from "ioredis";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const redis = new Redis(process.env.REDIS_URL || "");

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
  "createdAt",
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

async function createSearchIndex() {
  try {
    await redis.call("FT.INFO", INDEX_NAME);
    return;
  } catch (error) {
    await redis.call("FT.CREATE", INDEX_NAME, "PREFIX", "1", "post:", ...INDEX_SCHEMA);
  }
}

async function removeSearchIndexAndDocuments() {
  try {
    let results: any = await redis.call("FT.SEARCH", INDEX_NAME, "*");
    while (results[0] > 0) {
      for (let i = 1; i < results.length; i += 2) {
        const docId = results[i];

        await redis.call("FT.DEL", INDEX_NAME, docId);
      }
      results = await redis.call("FT.SEARCH", INDEX_NAME, "*");
    }
    await redis.call("FT.DROPINDEX", INDEX_NAME);
  } catch (error: any) {
    console.error(`Error deleting index '${INDEX_NAME}':`, error.message);
  }
}

async function upsertDocumentToIndex(data: any) {
  try {
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
      "createdAt",
      data.createdAt?.toDate(),
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
  } catch (error: any) {
    console.error(`Error adding document '${data.doc_id}' to index '${INDEX_NAME}':`, error.message);
  }
}

async function removeDocumentFromIndex(data: any) {
  await redis.call("FT.DEL", INDEX_NAME, `post:${data.collection_id}:${data.doc_id}`);
}

async function redisSearchByName(q: any, filters: any) {
  let query = "";
  const args = [];
  const needAllProjects = !q && Object.keys(filters).length === 0;

  args.push("FT.SEARCH");
  args.push(INDEX_NAME);

  if (needAllProjects) {
    query = "*";
  } else {
    if (q) {
      query += `(@name:${q}*) | (@cleanedName:${convertToCleanedName(q)}*)`;
    }

    if (filters.category && filters.category !== "all") {
      query += ` @category:{${escapeSpecialCharacters(filters.category)}}`;
    }

    if (filters.classification && filters.classification !== "all") {
      query += ` @classification:{${escapeSpecialCharacters(filters.classification)}}`;
    }

    if (filters.status && filters.status !== "all") {
      query += ` @status:{${escapeSpecialCharacters(filters.status)}}`;
    }

    if (filters.totalFund && filters.totalFund !== "all") {
      switch (filters.totalFund) {
        case "less-than-100":
          query += ` @totalFund:[0 100000000]`;
          break;
        case "100-to-200":
          query += ` @totalFund:[100000000 200000000]`;
          break;
        case "200-to-300":
          query += ` @totalFund:[200000000 300000000]`;
          break;
        case "300-to-400":
          query += ` @totalFund:[300000000 400000000]`;
          break;
        case "more-than-400":
          query += ` @totalFund:[400000000 inf]`;
          break;
        default:
          break;
      }
    }

    if (filters.province && filters.province !== "all") {
      query += ` @province:{${escapeSpecialCharacters(filters.province)}}`;
    }
  }

  args.push(query);
  args.push("SORTBY", "category", "DESC");
  args.push("LIMIT", 0, 10000);

  const results: any = await redis.call(...(args as [string, ...any[]]));
  const transformedResults = [];
  for (let i = 1; i < results.length; i += 2) {
    const redisKey = results[i];
    const fields = results[i + 1];
    const obj: any = { redisKey };
    for (let j = 0; j < fields.length; j += 2) {
      const key = fields[j];
      const value = fields[j + 1];
      obj[key] = value;
    }
    transformedResults.push(obj);
  }

  let statsData = {};
  let provinceCount = {};
  if (needAllProjects) {
    statsData = getStatsData(transformedResults);
    provinceCount = getProvinceCount(transformedResults);
  }

  return { cachedResultData: transformedResults, totalValuesLength: transformedResults.length, statsData, provinceCount };
}

async function getValuesByCategoryInRedis(category: any, filters: any, start: any, end: any) {
  try {
    const categoryPostsKeyPattern = `post:${category}:*`;
    const sortedCategoryPosts = await getRedisDataWithKeyPattern(categoryPostsKeyPattern);

    // Scenario 1: Return a sorted array from start to end point
    if (start !== undefined && end !== undefined) {
      const parsedItems = sortedCategoryPosts.slice(start, end);
      return { cachedResultData: parsedItems, totalValuesLength: parsedItems.length };
    }

    // Scenario 2: Return a searched values array in admin
    if (Array.isArray(filters) && filters[0]) {
      const q = JSON.parse(filters[0]).value;
      if (!q) return { cachedResultData: sortedCategoryPosts, totalValuesLength: sortedCategoryPosts.length };
      const searchedResults = await redisSearchByName(q, { category });
      return searchedResults; // { cachedResultData: searchedResults, totalValuesLength: searchedResults.length };
    }

    // Scenario 3: Return a sorted array with the stats and/or filters operations
    let filteredValues = [...sortedCategoryPosts];
    if (filters && Object.keys(filters).length > 0 && !Object.values(filters).every((f) => f === "all")) {
      filteredValues = applyFilters(sortedCategoryPosts, filters);
    }

    const statsData = getStatsData(sortedCategoryPosts);
    const provinceCount = getProvinceCount(sortedCategoryPosts);
    return { cachedResultData: filteredValues, totalValuesLength: sortedCategoryPosts.length, statsData, provinceCount };
  } catch (error: any) {
    console.error("Error getting values from Redis:", error.message);
    throw error;
  }
}

async function getValueInRedis(key: string) {
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
  } catch (error: any) {
    console.error("Error getting value from Redis:", error.message);
    throw error;
  }
}

async function setExValueInRedis(key: string, value: any, exp = false) {
  try {
    if (exp) {
      await redis.set(key, JSON.stringify(value), "EX", DEFAULT_EXPIRATION);
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  } catch (error: any) {
    console.error("Error setting value in Redis:", error.message);
    throw error;
  }
}

async function delValueInRedis(key: string) {
  try {
    await redis.del(key);
  } catch (error: any) {
    console.error("Error deleting value from Redis:", error.message);
    throw error;
  }
}

const getRedisDataWithKeyPattern = async (categoryPostsKeyPattern: string) => {
  const categoryPostKeys = await redis.keys(categoryPostsKeyPattern);

  const pipeline = redis.pipeline();
  categoryPostKeys.forEach((key) => pipeline.hgetall(key));
  const results: any = await pipeline.exec();

  const posts = results
    .map(([err, postData]: [any, any]) => {
      if (err) {
        console.error(`Error fetching data for key: ${err}`);
        return null;
      }
      return postData;
    })
    .filter((post: any) => post !== null);

  posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts;
};

const getStatsData = (posts: any) => {
  const STATUSES = ["can-quyen-gop", "dang-xay-dung", "da-hoan-thanh"];
  const statsData: any = {};
  for (const post of posts) {
    if (statsData[post.classification]) {
      statsData[post.classification].count += 1;
      statsData[post.classification][post.status] += 1;
      if (["dang-xay-dung", "da-hoan-thanh"].includes(post.status)) {
        statsData[post.classification]["totalFund"] += Number(post.totalFund);
      }
    } else {
      statsData[post.classification] = {
        count: 1,
        [STATUSES[0]]: 0,
        [STATUSES[1]]: 0,
        [STATUSES[2]]: 0,
        totalFund: 0,
      };
      statsData[post.classification][post.status] += 1;
      if (["dang-xay-dung", "da-hoan-thanh"].includes(post.status)) {
        statsData[post.classification]["totalFund"] += Number(post.totalFund);
      }
    }
  }
  return statsData;
};

const getProvinceCount = (posts: any) => {
  const provinceCount: any = {};
  for (const post of posts) {
    if (provinceCount[post.province]) {
      provinceCount[post.province] += 1;
    } else {
      provinceCount[post.province] = 0;
      provinceCount[post.province] += 1;
    }
  }
  return provinceCount;
};

const applyFilters = (values: any, filters: any) => {
  const getNestedValue = (obj: any, path: any) => path.split(".").reduce((acc: any, part: any) => acc && acc[part], obj);

  return values.filter((item: any) => {
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
};

export {
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
  applyFilters,
  getStatsData,
  getRedisDataWithKeyPattern,
};
