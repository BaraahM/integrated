// Global test setup
import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Global test timeout
jest.setTimeout(30000);

// Mock console.log in tests to avoid noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  mockDate: (date: string) => {
    const mockDate = new Date(date);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  },
  restoreDate: () => {
    jest.restoreAllMocks();
  },
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(async () => {
  // Clean up any global resources here
});
