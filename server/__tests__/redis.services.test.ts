import { convertToCleanedName } from "../utils/search";
import { INDEX_NAME, upsertDocumentToIndex, removeDocumentFromIndex, getValueInRedis, delValueInRedis } from "../services/redis";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import dotenv from "dotenv";
import path from "path";
import Redis from "ioredis";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const redis = new Redis({
  port: 16958,
  host: process.env.REDIS_URL || "",
  username: "default",
  password: process.env.REDIS_PASSWORD,
  db: 0, // Defaults to 0
});
jest.mock("ioredis");

// Mock utility functions
jest.mock("../utils/search", () => ({
  convertToCleanedName: jest.fn((name: string) => name.replace(/[^\w\s]/gi, "")),
  escapeSpecialCharacters: jest.fn((str: string) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")),
}));

describe("get/set/del a value with a given key in Redis", () => {
  const mockKey = "testKey";
  const mockValue = { foo: "bar" };

  beforeEach(async () => jest.clearAllMocks());

  it("should return a string value if the key type is string", async () => {
    jest.spyOn(redis, "type").mockResolvedValueOnce("string");
    jest.spyOn(redis, "get").mockResolvedValueOnce(JSON.stringify(mockValue));

    const actualValue = await getValueInRedis(mockKey);
    expect(actualValue).toEqual(mockValue);
  });

  it("should return an object value if the key type is hash", async () => {
    jest.spyOn(redis, "type").mockResolvedValueOnce("hash");
    jest.spyOn(redis, "hgetall").mockResolvedValueOnce(mockValue);

    const actualValue = await getValueInRedis(mockKey);
    expect(actualValue).toEqual(mockValue);
  });

  it("should delete the value", async () => {
    jest.spyOn(redis, "del").mockResolvedValueOnce(0);

    await delValueInRedis(mockKey);
    expect(redis.del).toHaveBeenCalledWith(mockKey);
  });
});

describe("insert/update/remove a document from an index in Redis", () => {
  const mockData = {
    collection_id: "123",
    doc_id: "456",
    id: "id1",
    slug: "slug1",
    name: "Test name",
    createdAt: { toDate: () => new Date("2024-08-10") },
    thumbnail: "thumbnail_url",
    category: "category1",
    classification: "classification1",
    status: "active",
    subStatus: "gople",
    statusOrder: 0,
    totalFund: 1000,
    location: { province: "province1" },
    metadata: { constructionUnit: "VVC" },
  };

  beforeEach(async () => jest.clearAllMocks());

  it("should call upsertDocumentToIndex function with correct parameters", async () => {
    jest.spyOn(redis, "call").mockResolvedValueOnce(undefined);

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
      "createdAt",
      mockData.createdAt?.toDate(),
      "thumbnail",
      mockData.thumbnail,
      "category",
      mockData.category,
      "classification",
      mockData.classification,
      "status",
      mockData.status,
      "subStatus",
      mockData.subStatus,
      "statusOrder",
      mockData.statusOrder,
      "totalFund",
      mockData.totalFund,
      "province",
      convertToCleanedName(mockData.location?.province),
      "constructionUnit",
      mockData.metadata?.constructionUnit
    );
  });

  it("should call removeDocumentFromIndex function with correct parameters", async () => {
    jest.spyOn(redis, "call").mockResolvedValueOnce(undefined);

    await removeDocumentFromIndex(mockData);

    expect(redis.call).toHaveBeenCalledWith("FT.DEL", INDEX_NAME, `post:${mockData.collection_id}:${mockData.doc_id}`);
  });
});

// Further describe blocks can be added similarly...
