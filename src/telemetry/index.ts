import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics'
import { ConsoleSpanExporter, BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { config } from '@shared/config/env.js'
import { logger } from '@shared/utils/logger.js'

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: config.OTLP_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '1.0.0',
    environment: config.NODE_ENV,
  }),
)

const traceExporter = config.OTLP_ENDPOINT
  ? new OTLPTraceExporter({
      url: `${config.OTLP_ENDPOINT}/v1/traces`,
      headers: {},
    })
  : new ConsoleSpanExporter()

const metricReader = config.NODE_ENV === 'production'
  ? new PrometheusExporter({
      port: 9090,
      endpoint: '/metrics',
    }, () => {
      logger.info('Prometheus metrics server started on port 9090')
    })
  : new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 10000,
    })

export const sdk = new NodeSDK({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  metricReader,
  instrumentations: [
    new HttpInstrumentation({
      requestHook: (span, request) => {
        span.setAttribute('http.request.body.size', request.headers['content-length'] ?? 0)
      },
      responseHook: (span, response) => {
        span.setAttribute('http.response.body.size', response.headers['content-length'] ?? 0)
      },
      ignoreIncomingRequestHook: (request) => {
        const ignorePaths = ['/health', '/ready', '/metrics', '/favicon.ico']
        return ignorePaths.some(path => request.url?.includes(path))
      },
    }),
    new FastifyInstrumentation({
      requestHook: (span, info) => {
        span.setAttribute('fastify.handler', info.request.routeOptions.handler.name)
        span.setAttribute('fastify.route', info.request.routeOptions.url ?? 'unknown')
      },
    }),
    new PinoInstrumentation({
      logHook: (span, record) => {
        record['trace_id'] = span.spanContext().traceId
        record['span_id'] = span.spanContext().spanId
        record['trace_flags'] = span.spanContext().traceFlags
      },
    }),
  ],
})

propagation.setGlobalPropagator(new W3CTraceContextPropagator())

export const initializeTelemetry = async (): Promise<void> => {
  if (!config.ENABLE_TELEMETRY) {
    logger.info('Telemetry disabled by configuration')
    return
  }

  try {
    await sdk.start()
    logger.info('OpenTelemetry initialized successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to initialize OpenTelemetry')
    throw error
  }
}

export const shutdownTelemetry = async (): Promise<void> => {
  try {
    await sdk.shutdown()
    logger.info('OpenTelemetry shut down successfully')
  } catch (error) {
    logger.error({ error }, 'Error shutting down OpenTelemetry')
  }
}

export const tracer = trace.getTracer(config.OTLP_SERVICE_NAME)

export const withSpan = async <T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, unknown>,
): Promise<T> => {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, String(value))
        })
      }
      
      const result = await fn()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}