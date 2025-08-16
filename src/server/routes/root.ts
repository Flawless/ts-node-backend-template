import { Type, type Static } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

const RootResponse = Type.Object({
  message: Type.String(),
  timestamp: Type.String({ format: 'date-time' }),
  path: Type.String(),
  method: Type.String(),
  requestId: Type.String(),
})

type RootResponseType = Static<typeof RootResponse>

export const rootRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Root endpoint',
      tags: ['Root'],
      response: {
        200: RootResponse,
      },
    },
    handler: async (request, _reply): Promise<RootResponseType> => {
      return {
        message: 'Node Backend Template API',
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId: request.id,
      }
    },
  })
}