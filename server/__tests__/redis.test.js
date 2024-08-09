jest.mock('ioredis');

const Redis = require('ioredis');
const redis = new Redis();

const { 
  delValueInRedis,
  setExValueInRedis,
} = require('../services/redis');

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