// Node.js Framework Technical Specification
// Purpose: Replace Bun/Elysia with optimal Node.js framework maintaining strictness

export interface FrameworkRequirements {
  // Performance Requirements
  readonly minRequestsPerSecond: number; // >50K RPS target
  readonly maxLatency: number; // <5ms median latency
  readonly memoryEfficiency: boolean;
  
  // TypeScript Requirements
  readonly nativeTypeScriptSupport: boolean;
  readonly schemaValidation: boolean;
  readonly strongTyping: boolean;
  
  // Ecosystem Requirements
  readonly middlewareEcosystem: boolean;
  readonly securityPlugins: boolean;
  readonly observabilityIntegration: boolean;
}

export interface FrameworkEvaluation {
  readonly name: string;
  readonly performance: {
    readonly requestsPerSecond: number;
    readonly medianLatency: number;
    readonly memoryFootprint: 'low' | 'medium' | 'high';
  };
  readonly typescript: {
    readonly nativeSupport: boolean;
    readonly schemaValidation: boolean;
    readonly typeInference: boolean;
  };
  readonly ecosystem: {
    readonly maturity: 'high' | 'medium' | 'low';
    readonly pluginCount: number;
    readonly securitySupport: boolean;
  };
  readonly migrationComplexity: 'low' | 'medium' | 'high';
}

// Technical Recommendation: Fastify
export const RECOMMENDED_FRAMEWORK: FrameworkEvaluation = {
  name: 'fastify',
  performance: {
    requestsPerSecond: 72000, // 4x faster than Express
    medianLatency: 4.1, // ms - lowest among major frameworks
    memoryFootprint: 'low'
  },
  typescript: {
    nativeSupport: true,
    schemaValidation: true, // JSON Schema based
    typeInference: true
  },
  ecosystem: {
    maturity: 'high',
    pluginCount: 200, // Official ecosystem
    securitySupport: true
  },
  migrationComplexity: 'low' // Similar patterns to Elysia
};

// Justification Matrix
export const FRAMEWORK_COMPARISON: Record<string, FrameworkEvaluation> = {
  fastify: RECOMMENDED_FRAMEWORK,
  express: {
    name: 'express',
    performance: {
      requestsPerSecond: 18000,
      medianLatency: 15.8,
      memoryFootprint: 'high'
    },
    typescript: {
      nativeSupport: false, // Requires @types
      schemaValidation: false, // Manual implementation
      typeInference: false
    },
    ecosystem: {
      maturity: 'high',
      pluginCount: 5000, // Largest ecosystem
      securitySupport: true
    },
    migrationComplexity: 'high' // Different patterns
  },
  koa: {
    name: 'koa',
    performance: {
      requestsPerSecond: 55000,
      medianLatency: 5.2,
      memoryFootprint: 'low'
    },
    typescript: {
      nativeSupport: false,
      schemaValidation: false,
      typeInference: false
    },
    ecosystem: {
      maturity: 'medium',
      pluginCount: 500,
      securitySupport: true
    },
    migrationComplexity: 'medium'
  }
};

// Migration Strategy from Elysia
export interface MigrationMapping {
  readonly elysiaPattern: string;
  readonly fastifyEquivalent: string;
  readonly complexity: 'direct' | 'adaptation' | 'rewrite';
}

export const ELYSIA_TO_FASTIFY_MAPPING: MigrationMapping[] = [
  {
    elysiaPattern: 'new Elysia().get(path, handler)',
    fastifyEquivalent: 'fastify.get(path, handler)',
    complexity: 'direct'
  },
  {
    elysiaPattern: '.onRequest(middleware)',
    fastifyEquivalent: 'fastify.addHook("onRequest", middleware)',
    complexity: 'direct'
  },
  {
    elysiaPattern: '.onAfterHandle(middleware)',
    fastifyEquivalent: 'fastify.addHook("onSend", middleware)',
    complexity: 'adaptation'
  },
  {
    elysiaPattern: '.onError(errorHandler)',
    fastifyEquivalent: 'fastify.setErrorHandler(errorHandler)',
    complexity: 'direct'
  }
];

// Framework Configuration Interface
export interface FastifyServerConfig {
  readonly host: string;
  readonly port: number;
  readonly logger: boolean | object;
  readonly bodyLimit: number;
  readonly keepAliveTimeout: number;
  readonly connectionTimeout: number;
  readonly trustProxy: boolean;
  readonly ignoreTrailingSlash: boolean;
  readonly caseSensitive: boolean;
}

export const PRODUCTION_SERVER_CONFIG: FastifyServerConfig = {
  host: '0.0.0.0',
  port: 3000,
  logger: true, // Pino integration
  bodyLimit: 1048576, // 1MB
  keepAliveTimeout: 72000,
  connectionTimeout: 10000,
  trustProxy: true,
  ignoreTrailingSlash: true,
  caseSensitive: false
};

// Type-safe Route Handler Signatures
export interface RouteHandler<TRequest = unknown, TReply = unknown> {
  (request: FastifyRequest<TRequest>, reply: FastifyReply<TReply>): Promise<TReply> | TReply;
}

export interface HealthCheckResponse {
  readonly status: 'ok' | 'degraded' | 'error';
  readonly timestamp: string;
  readonly uptime: number;
  readonly environment: string;
  readonly version: string;
  readonly checks?: Record<string, boolean>;
}

export interface ReadinessCheckResponse {
  readonly status: 'ready' | 'not_ready';
  readonly timestamp: string;
  readonly dependencies: Record<string, 'healthy' | 'unhealthy' | 'unknown'>;
}

// Schema Validation Types
export interface RouteSchema {
  readonly body?: object;
  readonly querystring?: object;
  readonly params?: object;
  readonly headers?: object;
  readonly response?: Record<number, object>;
}

// Plugin System Interface
export interface FastifyPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];
  register(fastify: FastifyInstance, options: unknown): Promise<void>;
}

// Essential Plugins List
export const REQUIRED_FASTIFY_PLUGINS: string[] = [
  '@fastify/helmet', // Security headers
  '@fastify/cors', // CORS handling
  '@fastify/rate-limit', // Rate limiting
  '@fastify/swagger', // API documentation
  '@fastify/swagger-ui', // Swagger UI
  '@fastify/env', // Environment validation
  '@fastify/under-pressure', // Health monitoring
  '@fastify/compress', // Response compression
  'fastify-opentelemetry' // Observability
];