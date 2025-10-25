import { connectDatabase, disconnectDatabase } from '../config/database';

// Setup before all tests
beforeAll(async () => {
  await connectDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await disconnectDatabase();
});

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});