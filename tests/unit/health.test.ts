import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '@server/app'
import type { FastifyInstance } from 'fastify'

describe('Health Routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('status', 'ok')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('uptime')
      expect(body).toHaveProperty('environment')
      expect(body).toHaveProperty('version')
      expect(body).toHaveProperty('memory')
      expect(body.memory).toHaveProperty('used')
      expect(body.memory).toHaveProperty('total')
      expect(body.memory).toHaveProperty('percentage')
    })
  })

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      })

      expect(response.statusCode).toBe(200)
      
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('status', 'ready')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('checks')
      expect(body.checks).toHaveProperty('server', true)
      expect(body.checks).toHaveProperty('memory', true)
      expect(body.checks).toHaveProperty('telemetry', true)
    })
  })
})