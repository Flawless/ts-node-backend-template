import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface RequestContext {
  requestId: string
  userId?: string
  tenantId?: string
  correlationId?: string
  startTime: number
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

declare module 'fastify' {
  interface FastifyRequest {
    context: RequestContext
  }
}

export const requestContext: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('context', null)
  
  fastify.addHook('onRequest', async (request) => {
    const correlationIdHeader = request.headers['x-correlation-id']
    const context: RequestContext = {
      requestId: request.id,
      correlationId: typeof correlationIdHeader === 'string' ? correlationIdHeader : undefined,
      startTime: Date.now(),
    }
    
    request.context = context
    
    asyncLocalStorage.enterWith(context)
  })
}

export const getRequestContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore()
}

export default fp(requestContext, {
  name: 'request-context',
  dependencies: [],
}) as FastifyPluginAsync