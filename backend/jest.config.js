/** @type {import('jest').Config} */
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/**',
    '!src/db/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    './src/utils/passwordValidator.js': {
      branches: 85,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './src/utils/responseHandler.js': {
      branches: 75,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/studentNumber/luhn.js': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/studentNumber/validator.js': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/studentNumber/generator.js': {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 88,
    },
    './src/services/auth.service.js': {
      branches: 40,
      functions: 40,
      lines: 48,
      statements: 48,
    },
  },
  forceExit: true,
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testTimeout: 10000,
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.integration.test.js'],
      setupFiles: ['<rootDir>/tests/integration/env.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      globalSetup: '<rootDir>/tests/integration/globalSetup.js',
      testTimeout: 30000,
    },
  ],
};
