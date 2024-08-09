const mockRedisInstance = {
  type: jest.fn(),
  get: jest.fn(),
  hgetall: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  call: jest.fn(),
  // Add more Redis methods as needed for your tests
};

const Redis = jest.fn(() => mockRedisInstance);

module.exports = Redis;