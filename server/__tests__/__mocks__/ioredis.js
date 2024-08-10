const mockRedisInstance = {
  type: jest.fn(),
  get: jest.fn(),
  hgetall: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  call: jest.fn(),
  zrevrange: jest.fn(),
  keys: jest.fn(),
  pipeline: () => ({
    hgetall: jest.fn()
      .mockResolvedValueOnce({ publishDate: '2024-08-10', content: 'Post 1' })
      .mockResolvedValueOnce({ publishDate: '2024-08-09', content: 'Post 2' }),
    exec: jest.fn().mockResolvedValue([
      [null, { publishDate: '2024-08-10', content: 'Post 1' }],
      [null, { publishDate: '2024-08-09', content: 'Post 2' }],
    ]),
  }),
  // Add more Redis methods as needed for your tests
};

const Redis = jest.fn(() => mockRedisInstance);

module.exports = Redis;