/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/{unit,integration}/**/*.test.ts'], // Match all `.test.ts` files in `tests/unit/` and `tests/integration/`
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",       // Ignore node_modules
    "server.ts",
    "app.ts",
    "container.ts",
    "config/env.ts",
    "interfaces/controllers",
    "interfaces/requests",
    "interfaces/responses",
    "shared/dependencyInjection",
    "shared/utils/prismaClient.ts",
    "shared/emailTemplates/EmailTemplates.ts",
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(mongodb|mongoose)/)', // Transform ES modules in mongodb and mongoose
  ],
  globals: {
    'ts-jest': {
      useESM: true, // Enable ES module compatibility for ts-jest
    },
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};