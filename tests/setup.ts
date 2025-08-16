import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.LOG_LEVEL = 'silent'
  process.env.ENABLE_TELEMETRY = 'false'
  process.env.SWAGGER_ENABLED = 'false'
})

afterAll(async () => {
  
})

beforeEach(async () => {
  
})

afterEach(async () => {
  
})