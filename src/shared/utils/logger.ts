import pino from 'pino'
import { config } from '@shared/config/env.js'

const isProduction = config.NODE_ENV === 'production'
const isDevelopment = config.NODE_ENV === 'development'

export const logger = pino({
  level: config.LOG_LEVEL,
  
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
      node_version: process.version,
    }),
  },
  
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.secret',
      '*.token',
      '*.apiKey',
      '*.sessionId',
    ],
    censor: '[REDACTED]',
  },
  
  timestamp: pino.stdTimeFunctions.isoTime,
  
  messageKey: 'message',
  errorKey: 'error',
  
  base: {
    env: config.NODE_ENV,
    service: config.OTLP_SERVICE_NAME,
  },
  
  mixin(_context, level) {
    return {
      severity: pino.levels.labels[level]?.toUpperCase(),
    }
  },
  
  hooks: {
    logMethod(inputArgs, method) {
      if (inputArgs.length >= 2) {
        const arg1 = inputArgs.shift()
        const arg2 = inputArgs[0]
        
        if (typeof arg1 === 'object' && typeof arg2 === 'string') {
          inputArgs[0] = arg1
          inputArgs.unshift(arg2)
        }
      }
      
      return method.apply(this, inputArgs as Parameters<typeof method>)
    },
  },
  
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
        messageFormat: '{message}',
        errorLikeObjectKeys: ['err', 'error'],
        errorProps: 'message,stack',
        customColors: 'err:red,info:blue,warn:yellow',
        singleLine: false,
      },
    },
  }),
})

export const createChildLogger = (bindings: Record<string, unknown>) => {
  return logger.child(bindings)
}