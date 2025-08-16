import { Type, type Static } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

const HealthResponse = Type.Object({
  status: Type.Literal('ok'),
  timestamp: Type.String({ format: 'date-time' }),
  uptime: Type.Number({ description: 'Uptime in seconds' }),
  environment: Type.String(),
  version: Type.String(),
  memory: Type.Object({
    used: Type.Number(),
    total: Type.Number(),
    percentage: Type.Number(),
  }),
})

const ReadyResponse = Type.Object({
  status: Type.Union([Type.Literal('ready'), Type.Literal('not_ready')]),
  timestamp: Type.String({ format: 'date-time' }),
  checks: Type.Object({
    server: Type.Boolean(),
    memory: Type.Boolean(),
    telemetry: Type.Boolean(),
  }),
  details: Type.Optional(Type.String()),
})

type HealthResponseType = Static<typeof HealthResponse>
type ReadyResponseType = Static<typeof ReadyResponse>

export const healthRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/health',
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: HealthResponse,
      },
    },
    handler: async (_request, _reply): Promise<HealthResponseType> => {
      const memUsage = process.memoryUsage()
      const totalMem = memUsage.rss
      const usedMem = memUsage.heapUsed
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV ?? 'development',
        version: process.env.npm_package_version ?? '1.0.0',
        memory: {
          used: Math.round(usedMem / 1024 / 1024),
          total: Math.round(totalMem / 1024 / 1024),
          percentage: Math.round((usedMem / totalMem) * 100),
        },
      }
    },
  })

  fastify.route({
    method: 'GET',
    url: '/ready',
    schema: {
      description: 'Readiness check endpoint',
      tags: ['Health'],
      response: {
        200: ReadyResponse,
        503: ReadyResponse,
      },
    },
    handler: async (_request, reply): Promise<ReadyResponseType> => {
      const checks = {
        server: true,
        memory: process.memoryUsage().heapUsed < 1024 * 1024 * 1024,
        telemetry: true,
      }
      
      const isReady = Object.values(checks).every(Boolean)
      
      if (!isReady) {
        reply.code(503)
      }
      
      return {
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks,
        ...(isReady ? {} : { details: 'One or more checks failed' }),
      }
    },
  })
}