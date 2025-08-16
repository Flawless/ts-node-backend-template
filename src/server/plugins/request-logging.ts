import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

export const requestLogging: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    request.log.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      referer: request.headers.referer,
    }, 'Request received')
  })

  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.elapsedTime
    
    request.log.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime,
      contentLength: reply.getHeader('content-length'),
    }, 'Request completed')
    
    reply.header('X-Response-Time', `${responseTime}ms`)
  })
}

export default fp(requestLogging, {
  name: 'request-logging',
  dependencies: [],
}) as FastifyPluginAsync