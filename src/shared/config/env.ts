import { Type, type Static } from '@sinclair/typebox'
import envSchema from 'env-schema'

const schema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test'),
  ], { default: 'development' }),
  
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Number({ default: 3000 }),
  
  LOG_LEVEL: Type.Union([
    Type.Literal('fatal'),
    Type.Literal('error'),
    Type.Literal('warn'),
    Type.Literal('info'),
    Type.Literal('debug'),
    Type.Literal('trace'),
    Type.Literal('silent'),
  ], { default: 'info' }),
  
  ENABLE_REQUEST_LOGGING: Type.Boolean({ default: true }),
  ENABLE_TELEMETRY: Type.Boolean({ default: true }),
  
  CORS_ORIGIN: Type.String({ default: 'http://localhost:3000' }),
  RATE_LIMIT_MAX: Type.Number({ default: 100 }),
  RATE_LIMIT_WINDOW_MS: Type.Number({ default: 60000 }),
  
  BODY_LIMIT: Type.Number({ default: 1048576 }),
  
  OTLP_ENDPOINT: Type.Optional(Type.String()),
  OTLP_SERVICE_NAME: Type.String({ default: 'node-backend-template' }),
  
  SWAGGER_ENABLED: Type.Boolean({ default: true }),
  SWAGGER_PATH: Type.String({ default: '/documentation' }),
  
  GRACEFUL_SHUTDOWN_TIMEOUT: Type.Number({ default: 10000 }),
})

export type Config = Static<typeof schema>

export const config: Config = envSchema({
  schema,
  dotenv: true,
  expandEnv: true,
})