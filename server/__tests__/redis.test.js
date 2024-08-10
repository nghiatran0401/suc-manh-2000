jest.mock('ioredis');

const Redis = require('ioredis');
const redis = new Redis();

const { 
  delValueInRedis,
  setExValueInRedis,
  applyFilters,
  getStatsData,
  getValueInRedis,
  createSearchIndex,
  getRedisDataWithKeyPattern,
  removeDocumentFromIndex,
  upsertDocumentToIndex,
  redisSearchByName,
} = require('../services/redis');

const { convertToCleanedName, escapeSpecialCharacters } = require('../utils/search');

jest.mock('../utils/search', () => ({
  convertToCleanedName: jest.fn(),
  escapeSpecialCharacters: jest.fn(),
}));

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

describe('delValueInRedis', () => {
  const mockKey = 'testKey';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the value from Redis for the given key', async () => {
    redis.del.mockResolvedValueOnce(1);

    await delValueInRedis(mockKey);

    expect(redis.del).toHaveBeenCalledWith(mockKey);
  });
});

describe('setExValueInRedis', () => {
  const mockKey = 'testKey';
  const mockValue = { foo: 'bar' };
  const DEFAULT_EXPIRATION = 86400;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set value in Redis without expiration when exp is false', async () => {
    redis.set.mockResolvedValueOnce('OK');

    await setExValueInRedis(mockKey, mockValue);

    expect(redis.set).toHaveBeenCalledWith(mockKey, JSON.stringify(mockValue));
  });

  it('should set value in Redis with expiration when exp is true', async () => {
    redis.set.mockResolvedValueOnce('OK');

    await setExValueInRedis(mockKey, mockValue, true);

    expect(redis.set).toHaveBeenCalledWith(mockKey, JSON.stringify(mockValue), 'EX', DEFAULT_EXPIRATION);
  });
});

describe('applyFilters', () => {
  const mockData = [
    { name: 'Company A', category: 'Tech', totalFund: 90000000 },
    { name: 'Company B', category: 'Finance', totalFund: 150000000 },
    { name: 'Company C', category: 'Tech', totalFund: 250000000 },
    { name: 'Company D', category: 'Health', totalFund: 350000000 },
    { name: 'Company E', category: 'Finance', totalFund: 450000000 },
  ];

  it('should return all items when filters are set to "all"', () => {
    const filters = { category: 'all', totalFund: 'all' };
    const result = applyFilters(mockData, filters);

    expect(result).toEqual(mockData);
  });

  it('should filter items by category', () => {
    const filters = { category: 'Tech' };
    const expected = [
      { name: 'Company A', category: 'Tech', totalFund: 90000000 },
      { name: 'Company C', category: 'Tech', totalFund: 250000000 },
    ];

    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it('should filter items by totalFund less than 100 million', () => {
    const filters = { totalFund: 'less-than-100' };
    const expected = [
      { name: 'Company A', category: 'Tech', totalFund: 90000000 },
    ];

    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it('should filter items by totalFund between 100 million and 200 million', () => {
    const filters = { totalFund: '100-to-200' };
    const expected = [
      { name: 'Company B', category: 'Finance', totalFund: 150000000 },
    ];

    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it('should filter items by totalFund more than 400 million', () => {
    const filters = { totalFund: 'more-than-400' };
    const expected = [
      { name: 'Company E', category: 'Finance', totalFund: 450000000 },
    ];

    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it('should filter items by multiple criteria', () => {
    const filters = { category: 'Finance', totalFund: 'more-than-400' };
    const expected = [
      { name: 'Company E', category: 'Finance', totalFund: 450000000 },
    ];

    const result = applyFilters(mockData, filters);

    expect(result).toEqual(expected);
  });

  it('should return an empty array when no items match the filters', () => {
    const filters = { category: 'Tech', totalFund: 'more-than-400' };
    const result = applyFilters(mockData, filters);

    expect(result).toEqual([]);
  });
});

describe('getStatsData', () => {
  it('should return an empty object when posts array is empty', () => {
    const posts = [];
    const result = getStatsData(posts);
    
    expect(result).toEqual({});
  });

  it('should correctly count posts by classification and status', () => {
    const posts = [
      { classification: 'A', status: 'can-quyen-gop' },
      { classification: 'A', status: 'dang-xay-dung' },
      { classification: 'B', status: 'can-quyen-gop' },
      { classification: 'A', status: 'da-hoan-thanh' },
      { classification: 'B', status: 'dang-xay-dung' },
      { classification: 'A', status: 'can-quyen-gop' },
    ];

    const expected = {
      A: {
        count: 4,
        'can-quyen-gop': 2,
        'dang-xay-dung': 1,
        'da-hoan-thanh': 1,
      },
      B: {
        count: 2,
        'can-quyen-gop': 1,
        'dang-xay-dung': 1,
        'da-hoan-thanh': 0,
      },
    };

    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it('should handle posts with the same classification but different statuses', () => {
    const posts = [
      { classification: 'A', status: 'can-quyen-gop' },
      { classification: 'A', status: 'can-quyen-gop' },
      { classification: 'A', status: 'da-hoan-thanh' },
    ];

    const expected = {
      A: {
        count: 3,
        'can-quyen-gop': 2,
        'dang-xay-dung': 0,
        'da-hoan-thanh': 1,
      },
    };

    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it('should initialize counts for each status to 0 if no posts exist for a specific status', () => {
    const posts = [
      { classification: 'A', status: 'da-hoan-thanh' },
    ];

    const expected = {
      A: {
        count: 1,
        'can-quyen-gop': 0,
        'dang-xay-dung': 0,
        'da-hoan-thanh': 1,
      },
    };

    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });

  it('should handle multiple classifications correctly', () => {
    const posts = [
      { classification: 'A', status: 'can-quyen-gop' },
      { classification: 'B', status: 'can-quyen-gop' },
      { classification: 'C', status: 'dang-xay-dung' },
    ];

    const expected = {
      A: {
        count: 1,
        'can-quyen-gop': 1,
        'dang-xay-dung': 0,
        'da-hoan-thanh': 0,
      },
      B: {
        count: 1,
        'can-quyen-gop': 1,
        'dang-xay-dung': 0,
        'da-hoan-thanh': 0,
      },
      C: {
        count: 1,
        'can-quyen-gop': 0,
        'dang-xay-dung': 1,
        'da-hoan-thanh': 0,
      },
    };

    const result = getStatsData(posts);

    expect(result).toEqual(expected);
  });
});

describe('getValueInRedis', () => {
  const mockKey = 'someKey';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return parsed value if the key type is string', async () => {
    const mockValue = { foo: 'bar' };
    redis.type.mockResolvedValueOnce('string');
    redis.get.mockResolvedValueOnce(JSON.stringify(mockValue));

    const result = await getValueInRedis(mockKey);

    expect(redis.type).toHaveBeenCalledWith(mockKey);
    expect(redis.get).toHaveBeenCalledWith(mockKey);
    expect(result).toEqual(mockValue);
  });

  it('should return object if the key type is hash', async () => {
    const mockValue = { field1: 'value1', field2: 'value2' };
    redis.type.mockResolvedValueOnce('hash');
    redis.hgetall.mockResolvedValueOnce(mockValue);

    const result = await getValueInRedis(mockKey);

    expect(redis.type).toHaveBeenCalledWith(mockKey);
    expect(redis.hgetall).toHaveBeenCalledWith(mockKey);
    expect(result).toEqual(mockValue);
  });

  it('should return null if the key type is neither string nor hash', async () => {
    redis.type.mockResolvedValueOnce('list'); // Unsupported type

    const result = await getValueInRedis(mockKey);

    expect(redis.type).toHaveBeenCalledWith(mockKey);
    expect(result).toBeNull();
  });

  it('should return null if string key has no value', async () => {
    redis.type.mockResolvedValueOnce('string');
    redis.get.mockResolvedValueOnce(null);

    const result = await getValueInRedis(mockKey);

    expect(redis.type).toHaveBeenCalledWith(mockKey);
    expect(redis.get).toHaveBeenCalledWith(mockKey);
    expect(result).toBeNull();
  });
});

describe('getRedisDataWithKeyPattern', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return sorted posts based on publishDate', async () => {
    const categoryPostsKeyPattern = 'post:*';
    const mockKeysResult = ['post:1', 'post:2'];
    
    redis.keys.mockResolvedValue(mockKeysResult);
    
    const result = await getRedisDataWithKeyPattern(categoryPostsKeyPattern);
    
    expect(result).toEqual([
      { publishDate: '2024-08-10', content: 'Post 1' },
      { publishDate: '2024-08-09', content: 'Post 2' },
    ]);
    
    expect(redis.keys).toHaveBeenCalledWith(categoryPostsKeyPattern);
  });
});

describe('createSearchIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an index if it does not exist and remove the existing index', async () => {
    redis.call.mockResolvedValueOnce(null);

    await createSearchIndex(redis);

    expect(redis.call).toHaveBeenCalledWith('FT.INFO', INDEX_NAME);
    expect(redis.call).toHaveBeenCalledWith('FT.CREATE', INDEX_NAME, 'PREFIX', '1', 'post:', ...INDEX_SCHEMA);
  });

  it('should handle the case where the index already exists', async () => {
    redis.call.mockResolvedValueOnce({});

    await createSearchIndex(redis);

    expect(redis.call).toHaveBeenCalledWith('FT.INFO', INDEX_NAME);
    expect(redis.call).toHaveBeenCalledWith('FT.CREATE', INDEX_NAME, 'PREFIX', '1', 'post:', ...INDEX_SCHEMA);
  });
});

describe('removeDocumentFromIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call redis.call with FT.DEL and correct parameters', async () => {
    const mockData = {
      collection_id: '123',
      doc_id: '456',
    };

    redis.call.mockResolvedValueOnce('OK');

    await removeDocumentFromIndex(mockData);

    expect(redis.call).toHaveBeenCalledWith('FT.DEL', INDEX_NAME, `post:${mockData.collection_id}:${mockData.doc_id}`);
  });
});

describe('upsertDocumentToIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mocks
  });

  it('should call redis.call with correct parameters', async () => {
    const mockData = {
      collection_id: '123',
      doc_id: '456',
      id: 'id1',
      slug: 'slug1',
      name: 'Test Name',
      publish_date: { toDate: () => new Date('2024-08-10') },
      thumbnail: 'thumbnail_url',
      category: 'category1',
      classification: 'classification1',
      status: 'active',
      totalFund: 1000,
      location: { province: 'province1' },
    };

    convertToCleanedName.mockReturnValue('cleaned_name');

    // Mock implementation for redis.call
    redis.call.mockResolvedValueOnce('OK');

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
      'cleaned_name',
      "publishDate",
      mockData.publish_date.toDate(),
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
});

describe('redisSearchByName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should construct the correct query and return transformed results', async () => {
    const q = 'example';
    const filters = {
    };

    const mockResults = [
      2,
      'doc1', ['name', 'Example Name', 'cleanedName', 'example', 'category', 'news'],
      'doc2', ['name', 'Another Name', 'cleanedName', 'another', 'category', 'news'],
    ];

    redis.call.mockResolvedValue(mockResults);

    const result = await redisSearchByName(q, filters);

    // Verify that redis.call was called with the correct parameters
    expect(redis.call).toHaveBeenCalledWith(
      'FT.SEARCH',
      INDEX_NAME,
      '(@name:example*) | (@cleanedName:cleaned_name*)',
      'SORTBY',
      'category',
      'DESC',
      'LIMIT',
      0,
      10000
    );
  });
});