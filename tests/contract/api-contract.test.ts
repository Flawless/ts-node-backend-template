import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '@server/app'
import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

describe('API Contract Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Health Endpoint Contract', () => {
    const HealthResponseSchema = Type.Object({
      status: Type.Literal('ok'),
      timestamp: Type.String({ format: 'date-time' }),
      uptime: Type.Number(),
      environment: Type.String(),
      version: Type.String(),
      memory: Type.Object({
        used: Type.Number(),
        total: Type.Number(),
        percentage: Type.Number(),
      }),
    })

    const healthValidator = TypeCompiler.Compile(HealthResponseSchema)

    it('should match health response contract', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      const valid = healthValidator.Check(body)
      if (!valid) {
        const errors = [...healthValidator.Errors(body)]
        console.error('Validation errors:', errors)
      }
      expect(valid).toBe(true)
    })

    it('should return correct content type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.headers['content-type']).toContain('application/json')
      expect(response.headers['content-type']).toContain('charset=utf-8')
    })

    it('should have reasonable uptime value', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const body = JSON.parse(response.body)
      expect(body.uptime).toBeGreaterThanOrEqual(0)
      expect(body.uptime).toBeLessThan(3600) // Less than 1 hour for test
    })

    it('should have valid memory metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const body = JSON.parse(response.body)
      expect(body.memory.used).toBeGreaterThan(0)
      expect(body.memory.total).toBeGreaterThan(0)
      expect(body.memory.percentage).toBeGreaterThanOrEqual(0)
      expect(body.memory.percentage).toBeLessThanOrEqual(100)
      expect(body.memory.used).toBeLessThanOrEqual(body.memory.total)
    })
  })

  describe('Ready Endpoint Contract', () => {
    const ReadyResponseSchema = Type.Object({
      status: Type.Union([Type.Literal('ready'), Type.Literal('not_ready')]),
      timestamp: Type.String({ format: 'date-time' }),
      checks: Type.Object({
        server: Type.Boolean(),
        memory: Type.Boolean(),
        telemetry: Type.Boolean(),
      }),
      details: Type.Optional(Type.String()),
    })

    const readyValidator = TypeCompiler.Compile(ReadyResponseSchema)

    it('should match ready response contract', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      })

      expect([200, 503]).toContain(response.statusCode)
      const body = JSON.parse(response.body)
      
      const valid = readyValidator.Check(body)
      if (!valid) {
        const errors = [...readyValidator.Errors(body)]
        console.error('Validation errors:', errors)
      }
      expect(valid).toBe(true)
    })

    it('should return 200 when ready', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      })

      const body = JSON.parse(response.body)
      if (body.status === 'ready') {
        expect(response.statusCode).toBe(200)
        expect(body.details).toBeUndefined()
      }
    })

    it('should return 503 when not ready', async () => {
      // This test validates the contract for not ready state
      // In real scenarios, you'd simulate a failure condition
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      })

      const body = JSON.parse(response.body)
      if (body.status === 'not_ready') {
        expect(response.statusCode).toBe(503)
        expect(body.details).toBeDefined()
      }
    })

    it('should have all required health checks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      })

      const body = JSON.parse(response.body)
      expect(body.checks).toHaveProperty('server')
      expect(body.checks).toHaveProperty('memory')
      expect(body.checks).toHaveProperty('telemetry')
      
      expect(typeof body.checks.server).toBe('boolean')
      expect(typeof body.checks.memory).toBe('boolean')
      expect(typeof body.checks.telemetry).toBe('boolean')
    })
  })

  describe('Root Endpoint Contract', () => {
    const RootResponseSchema = Type.Object({
      message: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      path: Type.String(),
      method: Type.String(),
      requestId: Type.String(),
    })

    const rootValidator = TypeCompiler.Compile(RootResponseSchema)

    it('should match root response contract', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      const valid = rootValidator.Check(body)
      if (!valid) {
        const errors = [...rootValidator.Errors(body)]
        console.error('Validation errors:', errors)
      }
      expect(valid).toBe(true)
    })

    it('should return correct method and path', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      const body = JSON.parse(response.body)
      expect(body.method).toBe('GET')
      expect(body.path).toBe('/')
    })

    it('should include valid request ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      const body = JSON.parse(response.body)
      expect(body.requestId).toMatch(/^[a-f0-9-]+$/)
    })
  })

  describe('Error Response Contract', () => {
    const ErrorResponseSchema = Type.Object({
      error: Type.String(),
      message: Type.String(),
      errorId: Type.String(),
      requestId: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      validation: Type.Optional(Type.Array(Type.Unknown())),
    })

    const errorValidator = TypeCompiler.Compile(ErrorResponseSchema)

    it('should match error response contract for 404', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      
      const valid = errorValidator.Check(body)
      if (!valid) {
        const errors = [...errorValidator.Errors(body)]
        console.error('Validation errors:', errors)
      }
      expect(valid).toBe(true)
    })

    it('should include error tracking IDs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent',
      })

      const body = JSON.parse(response.body)
      expect(body.errorId).toMatch(/^[a-f0-9-]+$/)
      expect(body.requestId).toMatch(/^[a-f0-9-]+$/)
    })

    it('should include timestamp in ISO format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent',
      })

      const body = JSON.parse(response.body)
      const timestamp = new Date(body.timestamp)
      expect(timestamp.toISOString()).toBe(body.timestamp)
    })
  })
})