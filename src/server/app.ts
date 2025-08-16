import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import compress from '@fastify/compress'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { Type } from '@sinclair/typebox'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { config } from '@shared/config/env.js'
import { logger } from '@shared/utils/logger.js'
import { healthRoutes } from './routes/health.js'
import { rootRoutes } from './routes/root.js'
import { errorHandler } from './plugins/error-handler.js'
import { requestLogging } from './plugins/request-logging.js'
import { requestContext } from './plugins/request-context.js'

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'request_id',
    genReqId: (req) => {
      const requestId = req.headers['x-request-id']
      return typeof requestId === 'string' ? requestId : crypto.randomUUID()
    },
    disableRequestLogging: !config.ENABLE_REQUEST_LOGGING,
    bodyLimit: config.BODY_LIMIT,
    caseSensitive: true,
    ignoreTrailingSlash: false,
    maxParamLength: 200,
    connectionTimeout: 30000,
    keepAliveTimeout: 5000,
    pluginTimeout: 10000,
    ...opts,
  }).withTypeProvider<TypeBoxTypeProvider>()

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: config.NODE_ENV === 'production',
  })

  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  })

  await app.register(compress, {
    global: true,
    threshold: 1024,
    encodings: ['gzip', 'deflate'],
  })

  await app.register(rateLimit, {
    global: true,
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    cache: 10000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    continueExceeding: false,
    enableDraftSpec: true,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  })

  if (config.SWAGGER_ENABLED) {
    await app.register(swagger, {
      openapi: {
        openapi: '3.1.0',
        info: {
          title: 'Node Backend Template API',
          description: 'Production-grade Node.js backend template with extreme strictness',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.PORT}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [],
        tags: [
          { name: 'Health', description: 'Health check endpoints' },
          { name: 'Root', description: 'Root endpoints' },
        ],
      },
    })

    await app.register(swaggerUI, {
      routePrefix: config.SWAGGER_PATH,
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        persistAuthorization: true,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => swaggerObject,
      transformSpecificationClone: true,
    })
  }

  await app.register(requestContext)
  await app.register(requestLogging)
  await app.register(errorHandler)

  await app.register(healthRoutes, { prefix: '/' })
  await app.register(rootRoutes, { prefix: '/' })

  await app.ready()

  return app
}