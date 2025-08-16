// Node.js Observability Stack Technical Specification
// Purpose: Complete observability mapping from Bun/Elysia to Node.js equivalent

export interface ObservabilityRequirements {
  readonly logging: {
    readonly structured: boolean;
    readonly performance: 'high' | 'medium' | 'low';
    readonly asyncSupport: boolean;
    readonly correlationIds: boolean;
  };
  readonly metrics: {
    readonly openTelemetry: boolean;
    readonly prometheus: boolean;
    readonly customMetrics: boolean;
  };
  readonly tracing: {
    readonly distributedTracing: boolean;
    readonly spanCreation: boolean;
    readonly instrumentationLevel: 'automatic' | 'manual' | 'hybrid';
  };
  readonly monitoring: {
    readonly healthChecks: boolean;
    readonly performanceMetrics: boolean;
    readonly errorTracking: boolean;
  };
}

// Logging Stack: Pino (Performance Leader 2025)
export interface LoggingConfig {
  readonly library: 'pino';
  readonly version: '^9.4.0';
  readonly performance: {
    readonly throughput: '10000+ logs/second';
    readonly overhead: 'minimal';
    readonly asyncLogging: boolean;
  };
  readonly features: {
    readonly structuredLogging: boolean;
    readonly childLoggers: boolean;
    readonly correlationIds: boolean;
    readonly prettyPrint: boolean;
  };
}

export const PINO_LOGGING_CONFIG: LoggingConfig = {
  library: 'pino',
  version: '^9.4.0',
  performance: {
    throughput: '10000+ logs/second',
    overhead: 'minimal',
    asyncLogging: true
  },
  features: {
    structuredLogging: true,
    childLoggers: true,
    correlationIds: true,
    prettyPrint: true // Development only
  }
};

// Logging Dependencies
export interface LoggingDependencies {
  readonly core: Record<string, string>;
  readonly transports: Record<string, string>;
  readonly utilities: Record<string, string>;
}

export const LOGGING_DEPENDENCIES: LoggingDependencies = {
  core: {
    'pino': '^9.4.0',
    'pino-pretty': '^13.0.0' // Development formatting
  },
  transports: {
    'pino-loki': '^2.3.1', // Grafana Loki integration
    'pino-elasticsearch': '^8.0.0', // Elasticsearch transport
    'pino-datadog': '^3.0.0' // DataDog transport
  },
  utilities: {
    'pino-http': '^10.3.0', // HTTP request logging
    'express-pino-logger': '^7.0.0' // Express integration (if needed)
  }
};

// OpenTelemetry Configuration
export interface OpenTelemetryConfig {
  readonly version: string;
  readonly autoInstrumentation: boolean;
  readonly manualInstrumentation: boolean;
  readonly exporters: string[];
  readonly processors: string[];
  readonly samplingRate: number;
}

export const OPENTELEMETRY_CONFIG: OpenTelemetryConfig = {
  version: '^0.54.2',
  autoInstrumentation: true,
  manualInstrumentation: true,
  exporters: ['otlp-http', 'jaeger', 'console'],
  processors: ['batch', 'simple'],
  samplingRate: 1.0 // 100% for development, configurable for production
};

// OpenTelemetry Dependencies
export interface OpenTelemetryDependencies {
  readonly core: Record<string, string>;
  readonly instrumentation: Record<string, string>;
  readonly exporters: Record<string, string>;
}

export const OPENTELEMETRY_DEPENDENCIES: OpenTelemetryDependencies = {
  core: {
    '@opentelemetry/api': '^1.9.0',
    '@opentelemetry/sdk-node': '^0.54.2',
    '@opentelemetry/sdk-trace-base': '^2.0.1'
  },
  instrumentation: {
    '@opentelemetry/auto-instrumentations-node': '^0.52.1',
    '@opentelemetry/instrumentation-fastify': '^0.39.0',
    '@opentelemetry/instrumentation-http': '^0.54.1',
    '@opentelemetry/instrumentation-pino': '^0.42.0'
  },
  exporters: {
    '@opentelemetry/exporter-trace-otlp-http': '^0.54.2',
    '@opentelemetry/exporter-jaeger': '^1.27.0',
    '@opentelemetry/exporter-prometheus': '^0.54.2'
  }
};

// Metrics Collection
export interface MetricsConfig {
  readonly prometheus: {
    readonly enabled: boolean;
    readonly endpoint: string;
    readonly port: number;
    readonly customMetrics: boolean;
  };
  readonly defaultMetrics: {
    readonly enabled: boolean;
    readonly prefix: string;
    readonly interval: number;
  };
}

export const METRICS_CONFIG: MetricsConfig = {
  prometheus: {
    enabled: true,
    endpoint: '/metrics',
    port: 9090,
    customMetrics: true
  },
  defaultMetrics: {
    enabled: true,
    prefix: 'nodejs_',
    interval: 5000 // 5 seconds
  }
};

// Metrics Dependencies
export interface MetricsDependencies {
  readonly prometheus: Record<string, string>;
  readonly fastify: Record<string, string>;
}

export const METRICS_DEPENDENCIES: MetricsDependencies = {
  prometheus: {
    'prom-client': '^15.1.3',
    'prometheus-gc-stats': '^0.8.0'
  },
  fastify: {
    'fastify-metrics': '^12.1.0',
    '@fastify/under-pressure': '^12.1.0' // Health monitoring
  }
};

// Health Check Configuration
export interface HealthCheckConfig {
  readonly endpoint: string;
  readonly checks: HealthCheck[];
  readonly timeout: number;
  readonly interval: number;
}

export interface HealthCheck {
  readonly name: string;
  readonly type: 'database' | 'external_service' | 'memory' | 'cpu' | 'disk';
  readonly timeout: number;
  readonly critical: boolean;
}

export const HEALTH_CHECK_CONFIG: HealthCheckConfig = {
  endpoint: '/health',
  timeout: 5000,
  interval: 30000,
  checks: [
    {
      name: 'database',
      type: 'database',
      timeout: 3000,
      critical: true
    },
    {
      name: 'memory',
      type: 'memory',
      timeout: 1000,
      critical: true
    },
    {
      name: 'external_api',
      type: 'external_service',
      timeout: 5000,
      critical: false
    }
  ]
};

// Monitoring Stack Integration
export interface MonitoringStack {
  readonly grafana: {
    readonly version: string;
    readonly dashboards: string[];
    readonly alerting: boolean;
  };
  readonly prometheus: {
    readonly version: string;
    readonly retention: string;
    readonly scrapeInterval: string;
  };
  readonly jaeger: {
    readonly version: string;
    readonly sampling: number;
    readonly storage: 'memory' | 'elasticsearch' | 'cassandra';
  };
  readonly loki: {
    readonly version: string;
    readonly retention: string;
    readonly compactor: boolean;
  };
}

export const MONITORING_STACK: MonitoringStack = {
  grafana: {
    version: '11.0.0', // 2025 version with AI features
    dashboards: [
      'nodejs-application-overview',
      'fastify-performance',
      'opentelemetry-traces',
      'error-rate-analysis'
    ],
    alerting: true
  },
  prometheus: {
    version: '2.54.0',
    retention: '15d',
    scrapeInterval: '15s'
  },
  jaeger: {
    version: '1.61.0',
    sampling: 0.1, // 10% sampling for production
    storage: 'memory' // For development
  },
  loki: {
    version: '3.1.0',
    retention: '7d',
    compactor: true
  }
};

// Error Tracking Configuration
export interface ErrorTrackingConfig {
  readonly sentry: {
    readonly enabled: boolean;
    readonly version: string;
    readonly environment: string;
    readonly tracing: boolean;
  };
  readonly customTracking: {
    readonly enabled: boolean;
    readonly storage: 'database' | 'file' | 'external';
  };
}

export const ERROR_TRACKING_CONFIG: ErrorTrackingConfig = {
  sentry: {
    enabled: true,
    version: '^8.33.1',
    environment: 'production',
    tracing: true
  },
  customTracking: {
    enabled: true,
    storage: 'database'
  }
};

// Observability Middleware Interfaces
export interface ObservabilityMiddleware {
  readonly name: string;
  readonly purpose: string;
  readonly integration: 'fastify' | 'opentelemetry' | 'pino';
  readonly configuration: object;
}

export const OBSERVABILITY_MIDDLEWARES: ObservabilityMiddleware[] = [
  {
    name: 'RequestLoggingMiddleware',
    purpose: 'Logs all HTTP requests with correlation IDs',
    integration: 'pino',
    configuration: {
      includeBody: false,
      includeHeaders: true,
      excludeHeaders: ['authorization', 'cookie']
    }
  },
  {
    name: 'TracingMiddleware', 
    purpose: 'Creates spans for HTTP requests and database queries',
    integration: 'opentelemetry',
    configuration: {
      autoTrace: true,
      customSpans: true,
      dbInstrumentation: true
    }
  },
  {
    name: 'MetricsMiddleware',
    purpose: 'Collects request metrics and performance data',
    integration: 'fastify',
    configuration: {
      endpoint: '/metrics',
      collectDefaultMetrics: true,
      customMetrics: ['request_duration', 'error_rate']
    }
  }
];

// Performance Monitoring
export interface PerformanceMonitoring {
  readonly memoryUsage: boolean;
  readonly cpuUsage: boolean;
  readonly eventLoopLag: boolean;
  readonly httpRequestDuration: boolean;
  readonly databaseQueryTime: boolean;
}

export const PERFORMANCE_MONITORING: PerformanceMonitoring = {
  memoryUsage: true,
  cpuUsage: true,
  eventLoopLag: true,
  httpRequestDuration: true,
  databaseQueryTime: true
};

// Alerting Configuration
export interface AlertingRules {
  readonly errorRate: {
    readonly threshold: number; // percentage
    readonly window: string; // time window
    readonly severity: 'warning' | 'critical';
  };
  readonly responseTime: {
    readonly threshold: number; // milliseconds
    readonly percentile: number;
    readonly severity: 'warning' | 'critical';
  };
  readonly memoryUsage: {
    readonly threshold: number; // percentage
    readonly severity: 'warning' | 'critical';
  };
}

export const ALERTING_RULES: AlertingRules = {
  errorRate: {
    threshold: 5, // 5% error rate
    window: '5m',
    severity: 'critical'
  },
  responseTime: {
    threshold: 1000, // 1 second
    percentile: 95,
    severity: 'warning'
  },
  memoryUsage: {
    threshold: 90, // 90% memory usage
    severity: 'critical'
  }
};

// Migration Mapping from Bun/Elysia Observability
export interface ObservabilityMigration {
  readonly bunElysiaComponent: string;
  readonly nodeJsEquivalent: string;
  readonly migrationComplexity: 'direct' | 'adaptation' | 'rewrite';
  readonly notes: string;
}

export const OBSERVABILITY_MIGRATION: ObservabilityMigration[] = [
  {
    bunElysiaComponent: 'Bun.serve() with built-in logging',
    nodeJsEquivalent: 'Fastify with Pino logging',
    migrationComplexity: 'adaptation',
    notes: 'Pino provides superior performance and features'
  },
  {
    bunElysiaComponent: 'Elysia onRequest/onAfterHandle logging',
    nodeJsEquivalent: 'Fastify hooks with Pino child loggers',
    migrationComplexity: 'direct',
    notes: 'Similar hook patterns, enhanced with correlation IDs'
  },
  {
    bunElysiaComponent: 'Basic OpenTelemetry integration',
    nodeJsEquivalent: 'Full OpenTelemetry auto-instrumentation',
    migrationComplexity: 'direct',
    notes: 'Enhanced with automatic Fastify instrumentation'
  },
  {
    bunElysiaComponent: 'Manual error tracking',
    nodeJsEquivalent: 'Sentry + structured logging',
    migrationComplexity: 'adaptation',
    notes: 'Professional error tracking with alerting'
  }
];