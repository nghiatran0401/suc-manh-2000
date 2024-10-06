import { jest } from "@jest/globals";

const mockRedisInstance = {
  type: jest.fn(),
  get: jest.fn(),
  hgetall: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  call: jest.fn(),
};

const Redis = jest.fn(() => mockRedisInstance);

module.exports = Redis;
