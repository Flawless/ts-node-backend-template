// Package.json Structure Technical Specification
// Purpose: Generic Node.js template for both backend and frontend applications

export interface PackageJsonStructure {
  readonly metadata: PackageMetadata;
  readonly scripts: PackageScripts;
  readonly dependencies: PackageDependencies;
  readonly devDependencies: PackageDevDependencies;
  readonly engines: PackageEngines;
  readonly configuration: PackageConfiguration;
}

export interface PackageMetadata {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly main: string;
  readonly type: 'module';
  readonly keywords: string[];
  readonly author: string;
  readonly license: 'MIT';
  readonly repository: RepositoryConfig;
}

export interface RepositoryConfig {
  readonly type: 'git';
  readonly url: string;
}

// Backend-focused Package Configuration
export const BACKEND_PACKAGE_METADATA: PackageMetadata = {
  name: 'node-backend-template',
  version: '1.0.0',
  description: 'Modern Node.js backend template with Fastify, TypeScript, and comprehensive testing',
  main: 'dist/index.js',
  type: 'module',
  keywords: [
    'nodejs',
    'typescript',
    'fastify',
    'backend',
    'api',
    'template',
    'testing-pyramid',
    'observability',
    'security',
    'enterprise'
  ],
  author: 'Template',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/example/node-backend-template.git'
  }
};

// Frontend-focused Package Configuration
export const FRONTEND_PACKAGE_METADATA: PackageMetadata = {
  name: 'node-frontend-template',
  version: '1.0.0', 
  description: 'Modern Node.js frontend template with build tools, TypeScript, and testing',
  main: 'dist/index.js',
  type: 'module',
  keywords: [
    'nodejs',
    'typescript',
    'frontend',
    'build-tools',
    'template',
    'testing',
    'bundling',
    'development'
  ],
  author: 'Template',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/example/node-frontend-template.git'
  }
};

// Comprehensive Script Configuration
export interface PackageScripts {
  readonly development: Record<string, string>;
  readonly build: Record<string, string>;
  readonly testing: Record<string, string>;
  readonly quality: Record<string, string>;
  readonly security: Record<string, string>;
  readonly maintenance: Record<string, string>;
}

export const BACKEND_SCRIPTS: PackageScripts = {
  development: {
    'start': 'node dist/index.js',
    'start:dev': 'tsx watch src/index.ts',
    'start:debug': 'node --inspect dist/index.js',
    'dev': 'tsx watch src/index.ts'
  },
  build: {
    'build': 'tsc',
    'build:watch': 'tsc --watch',
    'type-check': 'tsc --noEmit'
  },
  testing: {
    'test': 'vitest run',
    'test:watch': 'vitest',
    'test:ui': 'vitest --ui',
    'test:unit': 'vitest run tests/unit',
    'test:integration': 'vitest run tests/integration --sequential',
    'test:contract': 'vitest run tests/contract',
    'test:e2e': 'playwright test',
    'test:coverage': 'vitest run --coverage',
    'test:pyramid': 'npm run test:unit && npm run test:integration && npm run test:contract && npm run test:e2e'
  },
  quality: {
    'lint': 'eslint . --max-warnings 0',
    'lint:fix': 'eslint . --fix',
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
    'quality:duplication': 'jscpd src/ --threshold 3',
    'quality:complexity': 'madge --circular --extensions ts src/'
  },
  security: {
    'security:audit': 'npm audit',
    'security:licenses': 'license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;Python-2.0;MPL-2.0;CC0-1.0;CC-BY-3.0"',
    'security:scan': 'semgrep --config=auto src/'
  },
  maintenance: {
    'clean': 'rm -rf dist coverage .nyc_output',
    'prepare': 'husky',
    'pre-commit': 'npm run type-check && npm run lint && npm run format:check && npm run test:coverage',
    'validate:all': 'npm run security:audit && npm run security:licenses && npm run quality:duplication && npm run quality:complexity'
  }
};

export const FRONTEND_SCRIPTS: PackageScripts = {
  development: {
    'start': 'vite',
    'start:preview': 'vite preview',
    'dev': 'vite'
  },
  build: {
    'build': 'tsc && vite build',
    'build:watch': 'vite build --watch',
    'type-check': 'tsc --noEmit'
  },
  testing: {
    'test': 'vitest run',
    'test:watch': 'vitest',
    'test:ui': 'vitest --ui',
    'test:unit': 'vitest run tests/unit',
    'test:integration': 'vitest run tests/integration',
    'test:e2e': 'playwright test',
    'test:coverage': 'vitest run --coverage'
  },
  quality: {
    'lint': 'eslint . --max-warnings 0',
    'lint:fix': 'eslint . --fix',
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
    'quality:bundle-size': 'bundlesize',
    'quality:lighthouse': 'lighthouse-ci autorun'
  },
  security: {
    'security:audit': 'npm audit',
    'security:licenses': 'license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"',
    'security:scan': 'semgrep --config=auto src/'
  },
  maintenance: {
    'clean': 'rm -rf dist coverage .nyc_output',
    'prepare': 'husky',
    'pre-commit': 'npm run type-check && npm run lint && npm run format:check && npm run test:coverage'
  }
};

// Production Dependencies
export interface PackageDependencies {
  readonly core: Record<string, string>;
  readonly framework: Record<string, string>;
  readonly utilities: Record<string, string>;
  readonly observability: Record<string, string>;
}

export const BACKEND_DEPENDENCIES: PackageDependencies = {
  core: {
    'fastify': '^5.1.0',
    'typescript': '^5.6.2'
  },
  framework: {
    '@fastify/helmet': '^12.0.1',
    '@fastify/cors': '^10.0.1',
    '@fastify/rate-limit': '^10.1.1',
    '@fastify/swagger': '^9.1.0',
    '@fastify/swagger-ui': '^5.0.1',
    '@fastify/env': '^5.0.1',
    '@fastify/under-pressure': '^12.1.0',
    '@fastify/compress': '^8.0.1'
  },
  utilities: {
    'zod': '^3.23.8', // Schema validation
    'uuid': '^10.0.0',
    '@types/uuid': '^10.0.0'
  },
  observability: {
    'pino': '^9.4.0',
    '@opentelemetry/api': '^1.9.0',
    '@opentelemetry/sdk-node': '^0.54.2',
    '@opentelemetry/auto-instrumentations-node': '^0.52.1',
    '@opentelemetry/exporter-trace-otlp-http': '^0.54.2',
    'prom-client': '^15.1.3'
  }
};

export const FRONTEND_DEPENDENCIES: PackageDependencies = {
  core: {
    'typescript': '^5.6.2'
  },
  framework: {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    '@types/react': '^18.3.11',
    '@types/react-dom': '^18.3.1'
  },
  utilities: {
    'zod': '^3.23.8',
    'clsx': '^2.1.1',
    'date-fns': '^4.1.0'
  },
  observability: {
    '@opentelemetry/api': '^1.9.0',
    '@sentry/browser': '^8.33.1'
  }
};

// Development Dependencies
export interface PackageDevDependencies {
  readonly typescript: Record<string, string>;
  readonly testing: Record<string, string>;
  readonly quality: Record<string, string>;
  readonly security: Record<string, string>;
  readonly tools: Record<string, string>;
}

export const SHARED_DEV_DEPENDENCIES: PackageDevDependencies = {
  typescript: {
    'typescript': '^5.6.2',
    'tsx': '^4.19.1', // TypeScript execution
    '@types/node': '^22.7.5'
  },
  testing: {
    'vitest': '^3.0.0',
    '@vitest/coverage-v8': '^3.0.0',
    '@vitest/ui': '^3.0.0',
    'happy-dom': '^15.7.4',
    'playwright': '^1.48.0',
    '@playwright/test': '^1.48.0'
  },
  quality: {
    'eslint': '^9.11.1',
    '@typescript-eslint/eslint-plugin': '^8.8.0',
    '@typescript-eslint/parser': '^8.8.0',
    'eslint-config-prettier': '^9.1.0',
    'eslint-plugin-security': '^3.0.1',
    'eslint-plugin-no-only-tests': '^3.3.0',
    'prettier': '^3.3.3',
    'jscpd': '^4.0.4',
    'madge': '^8.0.0'
  },
  security: {
    'semgrep': '^1.87.0',
    'license-checker': '^25.0.1'
  },
  tools: {
    'husky': '^9.1.6',
    'rimraf': '^6.0.1' // Cross-platform rm -rf
  }
};

export const BACKEND_SPECIFIC_DEV_DEPENDENCIES = {
  testing: {
    'supertest': '^7.0.0',
    '@types/supertest': '^6.0.2',
    'testcontainers': '^10.15.0',
    'nock': '^14.0.0',
    'pact': '^13.1.3'
  },
  tools: {
    'pino-pretty': '^13.0.0' // Development logging
  }
};

export const FRONTEND_SPECIFIC_DEV_DEPENDENCIES = {
  build: {
    'vite': '^5.4.8',
    '@vitejs/plugin-react': '^4.3.2'
  },
  quality: {
    'bundlesize': '^0.18.2',
    '@lhci/cli': '^0.14.0' // Lighthouse CI
  }
};

// Engine Requirements
export interface PackageEngines {
  readonly node: string;
  readonly npm: string;
}

export const PACKAGE_ENGINES: PackageEngines = {
  node: '>=20.0.0', // LTS version
  npm: '>=10.0.0'
};

// Additional Configuration
export interface PackageConfiguration {
  readonly browserslist?: string[];
  readonly husky?: HuskyConfig;
  readonly prettier?: PrettierConfig;
  readonly bundlesize?: BundleSizeConfig[];
}

export interface HuskyConfig {
  readonly hooks: Record<string, string>;
}

export interface PrettierConfig {
  readonly semi: boolean;
  readonly singleQuote: boolean;
  readonly tabWidth: number;
  readonly trailingComma: 'es5' | 'all' | 'none';
  readonly printWidth: number;
}

export interface BundleSizeConfig {
  readonly path: string;
  readonly maxSize: string;
}

export const SHARED_CONFIGURATION: PackageConfiguration = {
  husky: {
    hooks: {
      'pre-commit': 'npm run pre-commit',
      'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
    }
  },
  prettier: {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 100
  }
};

export const FRONTEND_CONFIGURATION: PackageConfiguration = {
  ...SHARED_CONFIGURATION,
  browserslist: [
    '>0.2%',
    'not dead',
    'not ie <= 11',
    'not op_mini all'
  ],
  bundlesize: [
    {
      path: './dist/**/*.js',
      maxSize: '250kb'
    },
    {
      path: './dist/**/*.css',
      maxSize: '50kb'
    }
  ]
};

// Complete Package.json Templates
export const BACKEND_PACKAGE_JSON = {
  ...BACKEND_PACKAGE_METADATA,
  scripts: Object.values(BACKEND_SCRIPTS).reduce((acc, scripts) => ({ ...acc, ...scripts }), {}),
  dependencies: Object.values(BACKEND_DEPENDENCIES).reduce((acc, deps) => ({ ...acc, ...deps }), {}),
  devDependencies: {
    ...Object.values(SHARED_DEV_DEPENDENCIES).reduce((acc, deps) => ({ ...acc, ...deps }), {}),
    ...BACKEND_SPECIFIC_DEV_DEPENDENCIES.testing,
    ...BACKEND_SPECIFIC_DEV_DEPENDENCIES.tools
  },
  engines: PACKAGE_ENGINES,
  ...SHARED_CONFIGURATION
};

export const FRONTEND_PACKAGE_JSON = {
  ...FRONTEND_PACKAGE_METADATA,
  scripts: Object.values(FRONTEND_SCRIPTS).reduce((acc, scripts) => ({ ...acc, ...scripts }), {}),
  dependencies: Object.values(FRONTEND_DEPENDENCIES).reduce((acc, deps) => ({ ...acc, ...deps }), {}),
  devDependencies: {
    ...Object.values(SHARED_DEV_DEPENDENCIES).reduce((acc, deps) => ({ ...acc, ...deps }), {}),
    ...FRONTEND_SPECIFIC_DEV_DEPENDENCIES.build,
    ...FRONTEND_SPECIFIC_DEV_DEPENDENCIES.quality
  },
  engines: PACKAGE_ENGINES,
  ...FRONTEND_CONFIGURATION
};