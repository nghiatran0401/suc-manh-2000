const { convertToCleanedName, escapeSpecialCharacters } = require("../utils/search");
const {
  INDEX_NAME,
  redisSearchByName,
  upsertDocumentToIndex,
  removeDocumentFromIndex,
  getValueInRedis,
  getValuesByCategoryInRedis,
  setExValueInRedis,
  delValueInRedis,
  applyFilters,
  getStatsData,
} = require("../services/redis");

const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

jest.mock("ioredis");

// TODO: getValuesByCategoryInRedis (if necessary)

describe("get/set/del a value with a given key in Redis", () => {
  const mockKey = "testKey";
  const mockValue = { foo: "bar" };
  const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours

  beforeEach(() => jest.clearAllMocks());

  it("should return a string value if the key type is string", async () => {
    redis.type.mockResolvedValueOnce("string");
    redis.get.mockResolvedValueOnce(JSON.stringify(mockValue));

    const actualValue = await getValueInRedis(mockKey);
    expect(actualValue).toEqual(mockValue);
  });

  it("should return an object value if the key type is hash", async () => {
    redis.type.mockResolvedValueOnce("hash");
    redis.hgetall.mockResolvedValueOnce(mockValue);

    const actualValue = await getValueInRedis(mockKey);
    expect(actualValue).toEqual(mockValue);
  });

  it("should set value without expiration when exp is false", async () => {
    redis.set.mockResolvedValueOnce();
    await setExValueInRedis(mockKey, mockValue);
    expect(redis.set).toHaveBeenCalledWith(mockKey, JSON.stringify(mockValue));
  });

  it("should set a value with expiration when exp is true", async () => {
    redis.set.mockResolvedValueOnce();
    await setExValueInRedis(mockKey, mockValue, true);
    expect(redis.set).toHaveBeenCalledWith(mockKey, JSON.stringify(mockValue), "EX", DEFAULT_EXPIRATION);
  });

  it("should delete the value", async () => {
    redis.del.mockResolvedValueOnce();
    await delValueInRedis(mockKey);
    expect(redis.del).toHaveBeenCalledWith(mockKey);
  });
});

describe("insert/update/remove a document from an index in Redis", () => {
  beforeEach(() => jest.clearAllMocks());

  const mockData = {
    collection_id: "123",
    doc_id: "456",
    id: "id1",
    slug: "slug1",
    name: "Đây là tên bài viết %^*@#$",
    publish_date: { toDate: () => new Date("2024-08-10") },
    thumbnail: "thumbnail_url",
    category: "category1",
    classification: "classification1",
    status: "active",
    totalFund: 1000,
    location: { province: "province1" },
  };

  it("should call upsertDocumentToIndex function with correct parameters", async () => {
    redis.call.mockResolvedValueOnce();
    await upsertDocumentToIndex(mockData);

    expect(redis.call).toHaveBeenCalledWith(
      "FT.ADD",
      INDEX_NAME,
      `post:${mockData.collection_id}:${mockData.doc_id}`,
      1.0,
      "REPLACE",
      "FIELDS",
      "id",
      mockData.id,
      "slug",
      mockData.slug,
      "name",
      mockData.name,
      "cleanedName",
      convertToCleanedName(mockData.name),
      "publishDate",
      mockData.publish_date?.toDate(),
      "thumbnail",
      mockData.thumbnail,
      "category",
      mockData.category,
      "classification",
      mockData.classification,
      "status",
      mockData.status,
      "totalFund",
      mockData.totalFund,
      "province",
      mockData.location?.province
    );
  });

  it("should call removeDocumentFromIndex function with correct parameters", async () => {
    redis.call.mockResolvedValueOnce();
    await removeDocumentFromIndex(mockData);

    expect(redis.call).toHaveBeenCalledWith("FT.DEL", INDEX_NAME, `post:${mockData.collection_id}:${mockData.doc_id}`);
  });
});

describe("search a query with/without filters", () => {
  beforeEach(() => jest.clearAllMocks());

  const q = "bài viết";

  const mockRedisResults = [
    1,
    "doc1",
    [
      "id",
      "id1",
      "slug",
      "slug1",
      "name",
      "Đây là tên bài viết %^*@#$",
      "cleanedName",
      convertToCleanedName("Đây là tên bài viết %^*@#$"),
      "publishDate",
      "2024-08-10",
      "thumbnail",
      "thumbnail_url",
      "category",
      "news",
      "classification",
      "A",
      "status",
      "active",
      "totalFund",
      "1000",
      "province",
      "province1",
    ],
  ];
  const transformedResults = mockRedisResults
    .slice(1)
    .filter((_, index) => index % 2 === 0)
    .map((redisKey, index) => {
      const fields = mockRedisResults[index * 2 + 2];
      return fields.reduce(
        (obj, field, i) => {
          if (i % 2 === 0) {
            obj[field] = fields[i + 1];
          }
          return obj;
        },
        { redisKey }
      );
    });

  it("should call redisSearchByName function without filters", async () => {
    const filters = {};

    redis.call.mockResolvedValue(mockRedisResults);
    const actualResults = await redisSearchByName(q, filters);

    expect(redis.call).toHaveBeenCalledWith("FT.SEARCH", INDEX_NAME, `(@name:${q}*) | (@cleanedName:${convertToCleanedName(q)}*)`, "SORTBY", "category", "DESC", "LIMIT", 0, 10000);
    expect(actualResults).toEqual(transformedResults);
  });

  it("should call redisSearchByName function with filters", async () => {
    const filters = { category: "news" };

    redis.call.mockResolvedValue(mockRedisResults);
    const actualResults = await redisSearchByName(q, filters);

    expect(redis.call).toHaveBeenCalledWith(
      "FT.SEARCH",
      INDEX_NAME,
      `(@name:${q}*) | (@cleanedName:${convertToCleanedName(q)}*) @category:{${escapeSpecialCharacters(filters.category)}}`,
      "SORTBY",
      "category",
      "DESC",
      "LIMIT",
      0,
      10000
    );
    expect(actualResults).toEqual(transformedResults);
  });
});

describe("applyFilters", () => {
  const mockData = [
    { name: "Company A", category: "Tech", totalFund: 90000000 },
    { name: "Company B", category: "Finance", totalFund: 150000000 },
    { name: "Company C", category: "Tech", totalFund: 250000000 },
    { name: "Company D", category: "Health", totalFund: 350000000 },
    { name: "Company E", category: "Finance", totalFund: 450000000 },
  ];

  it('should return all items when filters are set to "all"', () => {
    const filters = { category: "all", totalFund: "all" };
    const expected = mockData;
    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it("should filter items by category", () => {
    const filters = { category: "Health" };
    const expected = [{ name: "Company D", category: "Health", totalFund: 350000000 }];
    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it("should filter items by totalFund", () => {
    const filters = { totalFund: "less-than-100" };
    const expected = [{ name: "Company A", category: "Tech", totalFund: 90000000 }];
    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it("should filter items by multiple criteria", () => {
    const filters = { category: "Finance", totalFund: "more-than-400" };
    const expected = [{ name: "Company E", category: "Finance", totalFund: 450000000 }];
    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it("should return an empty array when no items match the filters", () => {
    const filters = { category: "Tech", totalFund: "more-than-400" };
    const result = applyFilters(mockData, filters);

    expect(result).toEqual([]);
  });
});

describe("getStatsData", () => {
  it("should return an empty object when posts array is empty", () => {
    const posts = [];
    const expected = {};
    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it("should correctly count posts by classification and status", () => {
    const posts = [
      { classification: "A", status: "can-quyen-gop" },
      { classification: "A", status: "dang-xay-dung" },
      { classification: "B", status: "can-quyen-gop" },
      { classification: "A", status: "da-hoan-thanh" },
      { classification: "B", status: "dang-xay-dung" },
      { classification: "A", status: "can-quyen-gop" },
    ];
    const expected = {
      A: {
        count: 4,
        "can-quyen-gop": 2,
        "dang-xay-dung": 1,
        "da-hoan-thanh": 1,
        totalFund: NaN,
      },
      B: {
        count: 2,
        "can-quyen-gop": 1,
        "dang-xay-dung": 1,
        "da-hoan-thanh": 0,
        totalFund: NaN,
      },
    };
    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it("should handle posts with the same classification but different statuses", () => {
    const posts = [
      { classification: "A", status: "can-quyen-gop" },
      { classification: "A", status: "can-quyen-gop" },
      { classification: "A", status: "da-hoan-thanh" },
    ];
    const expected = {
      A: {
        count: 3,
        "can-quyen-gop": 2,
        "dang-xay-dung": 0,
        "da-hoan-thanh": 1,
        totalFund: NaN,
      },
    };
    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it("should initialize counts for each status to 0 if no posts exist for a specific status", () => {
    const posts = [{ classification: "A", status: "da-hoan-thanh" }];
    const expected = {
      A: {
        count: 1,
        "can-quyen-gop": 0,
        "dang-xay-dung": 0,
        "da-hoan-thanh": 1,
        totalFund: NaN,
      },
    };
    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it("should handle multiple classifications correctly", () => {
    const posts = [
      { classification: "A", status: "can-quyen-gop" },
      { classification: "B", status: "can-quyen-gop" },
      { classification: "C", status: "dang-xay-dung" },
    ];
    const expected = {
      A: {
        count: 1,
        "can-quyen-gop": 1,
        "dang-xay-dung": 0,
        "da-hoan-thanh": 0,
        totalFund: 0,
      },
      B: {
        count: 1,
        "can-quyen-gop": 1,
        "dang-xay-dung": 0,
        "da-hoan-thanh": 0,
        totalFund: 0,
      },
      C: {
        count: 1,
        "can-quyen-gop": 0,
        "dang-xay-dung": 1,
        "da-hoan-thanh": 0,
        totalFund: NaN,
      },
    };
    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });
});
