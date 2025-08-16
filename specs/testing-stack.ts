// Node.js Testing Stack Technical Specification
// Purpose: Complete testing pyramid implementation with 80% coverage requirement

export interface TestingPyramidDistribution {
  readonly unit: { min: 25; max: 30 }; // 25-30%
  readonly integration: { min: 45; max: 50 }; // 45-50%
  readonly contract: { min: 10; max: 15 }; // 10-15%
  readonly e2e: { min: 10; max: 15 }; // 10-15%
}

export const TESTING_PYRAMID: TestingPyramidDistribution = {
  unit: { min: 25, max: 30 },
  integration: { min: 45, max: 50 },
  contract: { min: 10, max: 15 },
  e2e: { min: 10, max: 15 }
};

// Core Testing Framework: Vitest (2025 recommendation)
export interface TestingFrameworkConfig {
  readonly framework: 'vitest';
  readonly version: '^3.0.0'; // Latest as of 2025
  readonly runner: 'node';
  readonly environment: 'node';
  readonly nativeESM: true;
  readonly typeScript: true;
  readonly coverage: {
    readonly provider: 'v8' | 'istanbul';
    readonly threshold: 80;
    readonly statements: 80;
    readonly branches: 80;
    readonly functions: 80;
    readonly lines: 80;
  };
}

export const VITEST_CONFIG: TestingFrameworkConfig = {
  framework: 'vitest',
  version: '^3.0.0',
  runner: 'node',
  environment: 'node',
  nativeESM: true,
  typeScript: true,
  coverage: {
    provider: 'v8', // Faster than istanbul
    threshold: 80,
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  }
};

// Testing Dependencies with Exact Versions
export interface TestingDependencies {
  readonly core: Record<string, string>;
  readonly mocking: Record<string, string>;
  readonly utilities: Record<string, string>;
  readonly e2e: Record<string, string>;
  readonly contract: Record<string, string>;
}

export const TESTING_DEPENDENCIES: TestingDependencies = {
  core: {
    'vitest': '^3.0.0',
    '@vitest/coverage-v8': '^3.0.0',
    '@vitest/ui': '^3.0.0', // Test UI for development
    'happy-dom': '^15.7.4' // Fast DOM environment
  },
  mocking: {
    'nock': '^14.0.0', // HTTP mocking
    'msw': '^2.4.9', // Service worker mocking
    'sinon': '^19.0.2', // Spies, stubs, mocks
    '@types/sinon': '^17.0.3'
  },
  utilities: {
    'supertest': '^7.0.0', // HTTP assertion library
    '@types/supertest': '^6.0.2',
    'testcontainers': '^10.15.0', // Docker containers for testing
    'faker': '^8.4.1', // Test data generation
    '@types/faker': '^8.4.7'
  },
  e2e: {
    'playwright': '^1.48.0', // E2E testing
    '@playwright/test': '^1.48.0'
  },
  contract: {
    'pact': '^13.1.3', // Contract testing
    '@pact-foundation/pact': '^13.1.3'
  }
};

// Test Configuration Interfaces
export interface UnitTestConfig {
  readonly pattern: string[];
  readonly timeout: number;
  readonly parallel: boolean;
  readonly isolate: boolean;
}

export interface IntegrationTestConfig {
  readonly pattern: string[];
  readonly timeout: number;
  readonly sequential: boolean; // Database tests
  readonly setup: string[];
  readonly teardown: string[];
}

export interface ContractTestConfig {
  readonly pattern: string[];
  readonly provider: string;
  readonly consumer: string;
  readonly pactDir: string;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface E2ETestConfig {
  readonly pattern: string[];
  readonly timeout: number;
  readonly browsers: ('chromium' | 'firefox' | 'webkit')[];
  readonly baseURL: string;
  readonly parallel: boolean;
}

// Complete Test Configurations
export const UNIT_TEST_CONFIG: UnitTestConfig = {
  pattern: ['tests/unit/**/*.test.ts'],
  timeout: 5000,
  parallel: true,
  isolate: true
};

export const INTEGRATION_TEST_CONFIG: IntegrationTestConfig = {
  pattern: ['tests/integration/**/*.test.ts'],
  timeout: 30000,
  sequential: true,
  setup: ['tests/integration/setup.ts'],
  teardown: ['tests/integration/teardown.ts']
};

export const CONTRACT_TEST_CONFIG: ContractTestConfig = {
  pattern: ['tests/contract/**/*.test.ts'],
  provider: 'node-backend-template',
  consumer: 'api-consumer',
  pactDir: './pacts',
  logLevel: 'info'
};

export const E2E_TEST_CONFIG: E2ETestConfig = {
  pattern: ['tests/e2e/**/*.test.ts'],
  timeout: 60000,
  browsers: ['chromium'],
  baseURL: 'http://localhost:3000',
  parallel: false
};

// Test Utilities and Helpers
export interface TestHelper {
  readonly name: string;
  readonly purpose: string;
  readonly dependencies: string[];
}

export const TEST_HELPERS: TestHelper[] = [
  {
    name: 'DatabaseTestHelper',
    purpose: 'Manages test database lifecycle and data seeding',
    dependencies: ['testcontainers']
  },
  {
    name: 'AuthTestHelper', 
    purpose: 'Generates test JWT tokens and auth contexts',
    dependencies: ['jsonwebtoken', 'faker']
  },
  {
    name: 'HttpTestHelper',
    purpose: 'Wraps supertest with common assertions',
    dependencies: ['supertest', 'fastify']
  },
  {
    name: 'MockTestHelper',
    purpose: 'Centralized mock factory and cleanup',
    dependencies: ['nock', 'sinon']
  }
];

// Coverage Configuration
export interface CoverageConfig {
  readonly provider: 'v8';
  readonly enabled: boolean;
  readonly clean: boolean;
  readonly all: boolean;
  readonly include: string[];
  readonly exclude: string[];
  readonly thresholds: {
    readonly global: CoverageThresholds;
    readonly perFile: CoverageThresholds;
  };
  readonly reporter: string[];
}

export interface CoverageThresholds {
  readonly statements: number;
  readonly branches: number;
  readonly functions: number;
  readonly lines: number;
}

export const COVERAGE_CONFIG: CoverageConfig = {
  provider: 'v8',
  enabled: true,
  clean: true,
  all: true,
  include: ['src/**/*.ts'],
  exclude: [
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'src/types/**',
    'src/**/*.d.ts'
  ],
  thresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    perFile: {
      statements: 70, // Slightly lower per file
      branches: 70,
      functions: 70,
      lines: 70
    }
  },
  reporter: ['text', 'html', 'lcov', 'json']
};

// Test Scripts Configuration
export interface TestScripts {
  readonly [key: string]: string;
}

export const TEST_SCRIPTS: TestScripts = {
  'test': 'vitest run',
  'test:watch': 'vitest',
  'test:ui': 'vitest --ui',
  'test:unit': 'vitest run tests/unit',
  'test:integration': 'vitest run tests/integration --sequential',
  'test:contract': 'vitest run tests/contract',
  'test:e2e': 'playwright test',
  'test:coverage': 'vitest run --coverage',
  'test:coverage:ui': 'vitest run --coverage --ui',
  'test:pyramid': 'npm run test:unit && npm run test:integration && npm run test:contract && npm run test:e2e'
};

// Test Environment Variables
export interface TestEnvironment {
  readonly NODE_ENV: 'test';
  readonly LOG_LEVEL: 'silent' | 'error';
  readonly DATABASE_URL: string;
  readonly JWT_SECRET: string;
  readonly PORT: number;
}

export const TEST_ENVIRONMENT: TestEnvironment = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  JWT_SECRET: 'test-secret-key',
  PORT: 0 // Random port for parallel tests
};

// Assertion Library Preferences
export interface AssertionLibraries {
  readonly primary: 'vitest/expect'; // Built-in
  readonly additional: string[];
}

export const ASSERTION_LIBRARIES: AssertionLibraries = {
  primary: 'vitest/expect',
  additional: [
    'chai', // For BDD style assertions
    'jest-extended' // Additional matchers
  ]
};

// Test File Structure
export interface TestFileStructure {
  readonly unit: string;
  readonly integration: string;
  readonly contract: string;
  readonly e2e: string;
  readonly helpers: string;
  readonly fixtures: string;
  readonly mocks: string;
}

export const TEST_FILE_STRUCTURE: TestFileStructure = {
  unit: 'tests/unit',
  integration: 'tests/integration', 
  contract: 'tests/contract',
  e2e: 'tests/e2e',
  helpers: 'tests/helpers',
  fixtures: 'tests/fixtures',
  mocks: 'tests/mocks'
};