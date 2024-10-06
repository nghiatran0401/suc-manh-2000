import { jest } from "@jest/globals";

const firestoreMock = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
};

const authMock = {
  // Add methods as needed
};

const bucketMock = {
  // Add methods as needed
};

const firebaseAdminMock = {
  firestore: jest.fn(() => firestoreMock),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  auth: jest.fn(() => authMock),
  storage: jest.fn(() => ({ bucket: jest.fn(() => bucketMock) })),
};

module.exports = firebaseAdminMock;
