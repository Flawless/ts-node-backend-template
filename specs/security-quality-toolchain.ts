// Security and Quality Toolchain Technical Specification
// Purpose: Maintain extreme strictness from original template with Node.js ecosystem

export interface SecurityRequirements {
  readonly staticAnalysis: boolean;
  readonly dependencyScanning: boolean;
  readonly secretDetection: boolean;
  readonly licenseCompliance: boolean;
  readonly codeQuality: boolean;
  readonly preCommitHooks: boolean;
  readonly zeroWarnings: boolean; // Extreme strictness
}

export const SECURITY_REQUIREMENTS: SecurityRequirements = {
  staticAnalysis: true,
  dependencyScanning: true,
  secretDetection: true,
  licenseCompliance: true,
  codeQuality: true,
  preCommitHooks: true,
  zeroWarnings: true
};

// ESLint Configuration (Extreme Strictness)
export interface ESLintConfig {
  readonly version: string;
  readonly parser: string;
  readonly plugins: string[];
  readonly extends: string[];
  readonly rules: ESLintRules;
  readonly maxWarnings: 0; // ZERO TOLERANCE
}

export interface ESLintRules {
  readonly typescript: Record<string, string | [string, object]>;
  readonly security: Record<string, string>;
  readonly quality: Record<string, string | [string, object]>;
  readonly forbidden: Record<string, string | [string, object]>;
}

export const ESLINT_CONFIG: ESLintConfig = {
  version: '^9.11.1',
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'security',
    'no-only-tests',
    'import',
    'unicorn',
    'sonarjs'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended',
    'plugin:unicorn/recommended',
    'plugin:sonarjs/recommended',
    'prettier' // Must be last
  ],
  maxWarnings: 0,
  rules: {
    typescript: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error'
    },
    security: {
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-object-injection': 'error',
      'security/detect-new-buffer': 'error'
    },
    quality: {
      'complexity': ['error', { max: 10 }],
      'max-depth': ['error', { max: 4 }],
      'max-lines': ['error', { max: 300 }],
      'max-lines-per-function': ['error', { max: 50 }],
      'max-params': ['error', { max: 4 }],
      'no-magic-numbers': ['error', { ignore: [0, 1, -1] }],
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }]
    },
    forbidden: {
      'no-console': 'error', // NO console.log in production
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-only-tests/no-only-tests': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAnyKeyword',
          message: 'any is forbidden - use proper types'
        },
        {
          selector: 'Literal[raw=/.*\\.only\\s*\\(/]',
          message: 'test.only() is forbidden in committed code'
        },
        {
          selector: 'Literal[raw=/.*\\.skip\\s*\\(/]',
          message: 'test.skip() is forbidden in committed code'
        }
      ]
    }
  }
};

// Security Dependencies
export interface SecurityDependencies {
  readonly staticAnalysis: Record<string, string>;
  readonly secretScanning: Record<string, string>;
  readonly dependencyChecking: Record<string, string>;
  readonly licenseChecking: Record<string, string>;
}

export const SECURITY_DEPENDENCIES: SecurityDependencies = {
  staticAnalysis: {
    'eslint': '^9.11.1',
    '@typescript-eslint/eslint-plugin': '^8.8.0',
    '@typescript-eslint/parser': '^8.8.0',
    'eslint-plugin-security': '^3.0.1',
    'eslint-plugin-unicorn': '^55.0.0',
    'eslint-plugin-sonarjs': '^2.0.2',
    'semgrep': '^1.87.0' // Advanced static analysis
  },
  secretScanning: {
    'detect-secrets': '^1.5.0', // Pre-commit secret detection
    'git-secrets': '^1.3.0', // Git hook integration
    'truffleHog': '^3.82.6' // Deep secret scanning
  },
  dependencyChecking: {
    'npm-audit-resolver': '^3.0.0-RC.0',
    'audit-ci': '^7.1.0',
    'snyk': '^1.1293.1', // Professional vulnerability scanning
    'retire': '^5.2.4' // JavaScript library vulnerability scanner
  },
  licenseChecking: {
    'license-checker': '^25.0.1',
    'license-compatibility-checker': '^0.3.0',
    'fossa-cli': '^3.9.4' // Enterprise license scanning
  }
};

// Quality Gates Configuration
export interface QualityGates {
  readonly coverage: CoverageGates;
  readonly complexity: ComplexityGates;
  readonly duplication: DuplicationGates;
  readonly security: SecurityGates;
  readonly performance: PerformanceGates;
}

export interface CoverageGates {
  readonly statements: number;
  readonly branches: number;
  readonly functions: number;
  readonly lines: number;
  readonly enforced: boolean;
}

export interface ComplexityGates {
  readonly cyclomaticComplexity: number;
  readonly cognitiveComplexity: number;
  readonly maxFunctionLength: number;
  readonly maxFileLength: number;
}

export interface DuplicationGates {
  readonly threshold: number; // percentage
  readonly minTokens: number;
  readonly minLines: number;
}

export interface SecurityGates {
  readonly vulnerabilities: 0; // ZERO TOLERANCE
  readonly licenseViolations: 0;
  readonly secretsDetected: 0;
}

export interface PerformanceGates {
  readonly bundleSize: string;
  readonly buildTime: number; // seconds
  readonly testExecutionTime: number; // seconds
}

export const QUALITY_GATES: QualityGates = {
  coverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
    enforced: true
  },
  complexity: {
    cyclomaticComplexity: 10,
    cognitiveComplexity: 15,
    maxFunctionLength: 50,
    maxFileLength: 300
  },
  duplication: {
    threshold: 3, // 3% maximum duplication
    minTokens: 50,
    minLines: 5
  },
  security: {
    vulnerabilities: 0,
    licenseViolations: 0,
    secretsDetected: 0
  },
  performance: {
    bundleSize: '250KB',
    buildTime: 30,
    testExecutionTime: 60
  }
};

// Quality Tools Configuration
export interface QualityTools {
  readonly codeQuality: Record<string, string>;
  readonly formatting: Record<string, string>;
  readonly documentation: Record<string, string>;
  readonly analysis: Record<string, string>;
}

export const QUALITY_TOOLS: QualityTools = {
  codeQuality: {
    'jscpd': '^4.0.4', // Code duplication detection
    'madge': '^8.0.0', // Circular dependency detection
    'complexity-report': '^2.0.0', // Complexity analysis
    'plato': '^1.7.0' // Code analysis and visualization
  },
  formatting: {
    'prettier': '^3.3.3',
    'eslint-config-prettier': '^9.1.0',
    'prettier-plugin-organize-imports': '^4.1.0'
  },
  documentation: {
    'typedoc': '^0.26.8', // TypeScript documentation
    'jsdoc': '^4.0.3',
    'doctoc': '^2.2.1' // Table of contents generator
  },
  analysis: {
    'source-map-explorer': '^2.5.3', // Bundle analysis
    'webpack-bundle-analyzer': '^4.10.2',
    'size-limit': '^11.1.5' // Bundle size control
  }
};

// Pre-commit Hooks Configuration
export interface PreCommitHooks {
  readonly husky: string;
  readonly hooks: PreCommitHook[];
  readonly enforced: boolean;
}

export interface PreCommitHook {
  readonly name: string;
  readonly command: string;
  readonly exitOnFail: boolean;
  readonly description: string;
}

export const PRE_COMMIT_HOOKS: PreCommitHooks = {
  husky: '^9.1.6',
  enforced: true,
  hooks: [
    {
      name: 'secret-detection',
      command: 'detect-secrets scan --all-files',
      exitOnFail: true,
      description: 'Prevent secrets from being committed'
    },
    {
      name: 'type-check',
      command: 'tsc --noEmit',
      exitOnFail: true,
      description: 'Ensure TypeScript compilation succeeds'
    },
    {
      name: 'lint',
      command: 'eslint . --max-warnings 0',
      exitOnFail: true,
      description: 'Enforce code quality and security rules'
    },
    {
      name: 'format-check',
      command: 'prettier --check .',
      exitOnFail: true,
      description: 'Ensure consistent code formatting'
    },
    {
      name: 'test-coverage',
      command: 'npm run test:coverage',
      exitOnFail: true,
      description: 'Maintain 80% test coverage minimum'
    },
    {
      name: 'security-audit',
      command: 'npm audit --audit-level moderate',
      exitOnFail: true,
      description: 'Check for known vulnerabilities'
    },
    {
      name: 'license-check',
      command: 'license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"',
      exitOnFail: true,
      description: 'Ensure license compliance'
    }
  ]
};

// CI/CD Quality Gates
export interface CicdQualityGates {
  readonly stages: CicdStage[];
  readonly failFast: boolean;
  readonly parallelExecution: boolean;
}

export interface CicdStage {
  readonly name: string;
  readonly commands: string[];
  readonly failureAction: 'fail' | 'warn' | 'continue';
  readonly timeout: number; // minutes
}

export const CICD_QUALITY_GATES: CicdQualityGates = {
  failFast: true,
  parallelExecution: true,
  stages: [
    {
      name: 'security-scan',
      commands: [
        'detect-secrets scan --all-files',
        'semgrep --config=auto src/',
        'npm audit --audit-level moderate',
        'snyk test'
      ],
      failureAction: 'fail',
      timeout: 10
    },
    {
      name: 'code-quality',
      commands: [
        'tsc --noEmit',
        'eslint . --max-warnings 0',
        'prettier --check .',
        'jscpd src/ --threshold 3',
        'madge --circular --extensions ts src/'
      ],
      failureAction: 'fail',
      timeout: 5
    },
    {
      name: 'testing',
      commands: [
        'npm run test:unit',
        'npm run test:integration',
        'npm run test:contract',
        'npm run test:e2e',
        'npm run test:coverage'
      ],
      failureAction: 'fail',
      timeout: 15
    },
    {
      name: 'build',
      commands: [
        'npm run build',
        'size-limit'
      ],
      failureAction: 'fail',
      timeout: 5
    }
  ]
};

// License Compliance Configuration
export interface LicenseCompliance {
  readonly allowedLicenses: string[];
  readonly forbiddenLicenses: string[];
  readonly manualReview: string[];
  readonly enforcement: 'strict' | 'permissive';
}

export const LICENSE_COMPLIANCE: LicenseCompliance = {
  enforcement: 'strict',
  allowedLicenses: [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    'Python-2.0',
    'MPL-2.0',
    'CC0-1.0',
    'CC-BY-3.0',
    'Unlicense'
  ],
  forbiddenLicenses: [
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-3.0',
    'LGPL-2.1',
    'LGPL-3.0',
    'CPAL-1.0',
    'EPL-1.0',
    'MPL-1.1'
  ],
  manualReview: [
    'CC-BY-SA-4.0',
    'OFL-1.1',
    'Artistic-2.0'
  ]
};

// Security Headers Configuration
export interface SecurityHeaders {
  readonly helmet: HelmetConfig;
  readonly cors: CorsConfig;
  readonly rateLimit: RateLimitConfig;
}

export interface HelmetConfig {
  readonly contentSecurityPolicy: boolean;
  readonly crossOriginEmbedderPolicy: boolean;
  readonly crossOriginOpenerPolicy: boolean;
  readonly crossOriginResourcePolicy: boolean;
  readonly originAgentCluster: boolean;
  readonly referrerPolicy: boolean;
  readonly strictTransportSecurity: boolean;
  readonly xContentTypeOptions: boolean;
  readonly xDnsPrefetchControl: boolean;
  readonly xDownloadOptions: boolean;
  readonly xFrameOptions: boolean;
  readonly xPermittedCrossDomainPolicies: boolean;
  readonly xPoweredBy: boolean;
  readonly xXssProtection: boolean;
}

export interface CorsConfig {
  readonly origin: string[] | boolean;
  readonly credentials: boolean;
  readonly optionsSuccessStatus: number;
  readonly allowedHeaders: string[];
  readonly exposedHeaders: string[];
}

export interface RateLimitConfig {
  readonly windowMs: number;
  readonly max: number;
  readonly standardHeaders: boolean;
  readonly legacyHeaders: boolean;
}

export const SECURITY_HEADERS: SecurityHeaders = {
  helmet: {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    originAgentCluster: true,
    referrerPolicy: true,
    strictTransportSecurity: true,
    xContentTypeOptions: true,
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xFrameOptions: true,
    xPermittedCrossDomainPolicies: true,
    xPoweredBy: false, // Hide server information
    xXssProtection: true
  },
  cors: {
    origin: false, // Disable CORS by default
    credentials: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  }
};