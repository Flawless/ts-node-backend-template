import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '@server/app'
import type { FastifyInstance } from 'fastify'

describe('Server Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Server Lifecycle', () => {
    it('should start and respond to requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('application/json')
    })

    it('should handle 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/unknown-route',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('error', 'Not Found')
      expect(body).toHaveProperty('requestId')
    })

    it('should include security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      expect(response.headers).toHaveProperty('x-dns-prefetch-control')
      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-content-type-options')
    })

    it('should handle compression', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
        headers: {
          'accept-encoding': 'gzip',
        },
      })

      expect(response.statusCode).toBe(200)
    })

    it('should respect rate limiting', async () => {
      const requests = Array.from({ length: 101 }, () =>
        app.inject({
          method: 'GET',
          url: '/',
        })
      )

      const responses = await Promise.all(requests)
      const rateLimited = responses.some(r => r.statusCode === 429)
      expect(rateLimited).toBe(true)
    })
  })

  describe('Request Context', () => {
    it('should generate request IDs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      expect(response.headers).toHaveProperty('x-request-id')
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('requestId')
    })

    it('should use provided request ID', async () => {
      const customId = 'custom-request-id'
      const response = await app.inject({
        method: 'GET',
        url: '/',
        headers: {
          'x-request-id': customId,
        },
      })

      expect(response.headers['x-request-id']).toBe(customId)
      const body = JSON.parse(response.body)
      expect(body.requestId).toBe(customId)
    })

    it('should track response time', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      expect(response.headers).toHaveProperty('x-response-time')
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/)
    })
  })

  describe('CORS Configuration', () => {
    it('should handle CORS headers', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/',
        headers: {
          'origin': 'http://localhost:3000',
          'access-control-request-method': 'GET',
        },
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers).toHaveProperty('access-control-allow-methods')
    })

    it('should expose custom headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
        headers: {
          'origin': 'http://localhost:3000',
        },
      })

      expect(response.headers['access-control-expose-headers']).toContain('X-Request-ID')
      expect(response.headers['access-control-expose-headers']).toContain('X-Response-Time')
    })
  })

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/',
        payload: 'invalid-json',
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('error')
      expect(body).toHaveProperty('errorId')
    })

    it('should handle large payloads', async () => {
      const largePayload = 'x'.repeat(2 * 1024 * 1024) // 2MB
      const response = await app.inject({
        method: 'POST',
        url: '/',
        payload: largePayload,
      })

      expect(response.statusCode).toBe(413)
    })
  })
})