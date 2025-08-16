import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  validation?: unknown[]
}

export const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: AppError, request, reply) => {
    const statusCode = error.statusCode ?? 500
    const errorId = crypto.randomUUID()
    
    request.log.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode,
        validation: error.validation,
      },
      errorId,
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Request error')
    
    if (statusCode >= 500) {
      reply.status(statusCode).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        errorId,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      })
    } else {
      reply.status(statusCode).send({
        error: error.name || 'Error',
        message: error.message,
        ...(error.validation && { validation: error.validation }),
        errorId,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      })
    }
  })

  fastify.setNotFoundHandler((request, reply) => {
    const errorId = crypto.randomUUID()
    
    request.log.warn({
      errorId,
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'Route not found')
    
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      errorId,
      requestId: request.id,
      timestamp: new Date().toISOString(),
    })
  })
}

export default fp(errorHandler, {
  name: 'error-handler',
  dependencies: [],
}) as FastifyPluginAsync