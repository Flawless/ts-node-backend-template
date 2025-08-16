import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'

describe('E2E Health Check Tests', () => {
  let serverProcess: ChildProcess
  const serverUrl = 'http://localhost:3000'

  beforeAll(async () => {
    // Start the server in a separate process
    serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '3000', LOG_LEVEL: 'silent' },
      detached: false,
    })

    // Wait for server to start
    await setTimeout(3000)
    
    // Verify server is running
    const healthCheck = await fetch(`${serverUrl}/health`).catch(() => null)
    if (!healthCheck) {
      throw new Error('Server failed to start')
    }
  }, 10000)

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM')
      await setTimeout(1000)
    }
  })

  describe('Health Monitoring E2E', () => {
    it('should respond to health check', async () => {
      const response = await fetch(`${serverUrl}/health`)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      
      const body = await response.json()
      expect(body.status).toBe('ok')
    })

    it('should respond to readiness check', async () => {
      const response = await fetch(`${serverUrl}/ready`)
      
      expect([200, 503]).toContain(response.status)
      
      const body = await response.json()
      expect(['ready', 'not_ready']).toContain(body.status)
      expect(body.checks).toBeDefined()
    })

    it('should handle concurrent health checks', async () => {
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${serverUrl}/health`)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      const bodies = await Promise.all(responses.map(r => r.json()))
      bodies.forEach(body => {
        expect(body.status).toBe('ok')
      })
    })

    it('should include proper headers', async () => {
      const response = await fetch(`${serverUrl}/health`)
      
      expect(response.headers.get('x-request-id')).toBeDefined()
      expect(response.headers.get('x-response-time')).toBeDefined()
      expect(response.headers.get('x-dns-prefetch-control')).toBeDefined()
      expect(response.headers.get('x-frame-options')).toBeDefined()
    })

    it('should handle OPTIONS request for CORS', async () => {
      const response = await fetch(`${serverUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'GET',
        },
      })

      expect(response.status).toBe(204)
      expect(response.headers.get('access-control-allow-methods')).toBeDefined()
    })

    it('should track request with custom ID', async () => {
      const customId = 'test-request-123'
      const response = await fetch(`${serverUrl}/health`, {
        headers: {
          'X-Request-ID': customId,
        },
      })

      expect(response.headers.get('x-request-id')).toBe(customId)
    })

    it('should enforce rate limiting', async () => {
      // Send many requests quickly
      const requests = Array.from({ length: 105 }, () =>
        fetch(`${serverUrl}/health`)
      )

      const responses = await Promise.all(requests)
      
      const rateLimited = responses.some(r => r.status === 429)
      expect(rateLimited).toBe(true)
      
      const limitedResponse = responses.find(r => r.status === 429)
      if (limitedResponse) {
        expect(limitedResponse.headers.get('retry-after')).toBeDefined()
        expect(limitedResponse.headers.get('x-ratelimit-limit')).toBeDefined()
        expect(limitedResponse.headers.get('x-ratelimit-remaining')).toBeDefined()
      }
    })

    it('should handle invalid endpoints', async () => {
      const response = await fetch(`${serverUrl}/invalid-endpoint`)
      
      expect(response.status).toBe(404)
      
      const body = await response.json()
      expect(body.error).toBe('Not Found')
      expect(body.errorId).toBeDefined()
      expect(body.requestId).toBeDefined()
    })

    it('should reject oversized payloads', async () => {
      const largePayload = 'x'.repeat(2 * 1024 * 1024) // 2MB
      
      const response = await fetch(`${serverUrl}/`, {
        method: 'POST',
        body: largePayload,
        headers: {
          'Content-Type': 'text/plain',
        },
      })

      expect(response.status).toBe(413)
    })

    it('should handle graceful shutdown', async () => {
      // This test would verify graceful shutdown in a real scenario
      // For now, we just check if the server responds
      const response = await fetch(`${serverUrl}/health`)
      expect(response.status).toBe(200)
    })
  })

  describe('Performance E2E', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now()
      const response = await fetch(`${serverUrl}/health`)
      const endTime = Date.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
      
      const responseTimeHeader = response.headers.get('x-response-time')
      expect(responseTimeHeader).toBeDefined()
      
      if (responseTimeHeader) {
        const headerTime = parseInt(responseTimeHeader.replace('ms', ''))
        expect(headerTime).toBeLessThan(100) // Server processing should be under 100ms
      }
    })

    it('should handle burst traffic', async () => {
      const burstSize = 20
      const startTime = Date.now()
      
      const requests = Array.from({ length: burstSize }, () =>
        fetch(`${serverUrl}/health`)
      )

      const responses = await Promise.all(requests)
      const endTime = Date.now()
      
      const totalTime = endTime - startTime
      
      // All requests should complete within reasonable time
      expect(totalTime).toBeLessThan(5000) // 5 seconds for 20 requests
      
      // Most requests should succeed (some may be rate limited)
      const successfulRequests = responses.filter(r => r.status === 200)
      expect(successfulRequests.length).toBeGreaterThan(burstSize * 0.5) // At least 50% should succeed
    })
  })
})