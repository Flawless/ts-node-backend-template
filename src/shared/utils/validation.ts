import { Type, type Static, type TSchema } from '@sinclair/typebox'
import { TypeCompiler, type TypeCheck } from '@sinclair/typebox/compiler'
import { Result } from './result.js'

/**
 * Compiled validators cache for performance
 */
const validatorCache = new Map<TSchema, TypeCheck<any>>()

/**
 * Get or create a compiled validator
 */
export function getValidator<T extends TSchema>(schema: T): TypeCheck<Static<T>> {
  let validator = validatorCache.get(schema)
  
  if (!validator) {
    validator = TypeCompiler.Compile(schema)
    validatorCache.set(schema, validator)
  }
  
  return validator as TypeCheck<Static<T>>
}

/**
 * Validate data against schema with detailed errors
 */
export function validate<T extends TSchema>(
  schema: T,
  data: unknown
): Result<Static<T>, ValidationError> {
  const validator = getValidator(schema)
  
  if (validator.Check(data)) {
    return Result.ok(data)
  }
  
  const errors = [...validator.Errors(data)].map(error => ({
    path: error.path,
    message: error.message,
    value: error.value,
  }))
  
  return Result.err(new ValidationError('Validation failed', errors))
}

/**
 * Assert data matches schema or throw
 */
export function assertValid<T extends TSchema>(
  schema: T,
  data: unknown,
  message?: string
): asserts data is Static<T> {
  const result = validate(schema, data)
  
  if (result.isErr()) {
    throw new ValidationError(
      message ?? 'Validation assertion failed',
      result.error.errors
    )
  }
}

/**
 * Custom validation error with detailed information
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{
      path: string
      message: string
      value: unknown
    }>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  Email: Type.String({ 
    format: 'email',
    minLength: 5,
    maxLength: 254,
  }),
  
  UUID: Type.String({ 
    format: 'uuid',
  }),
  
  URL: Type.String({ 
    format: 'uri',
  }),
  
  DateTime: Type.String({ 
    format: 'date-time',
  }),
  
  NonEmptyString: Type.String({ 
    minLength: 1,
    maxLength: 1000,
  }),
  
  PositiveInteger: Type.Integer({ 
    minimum: 1,
  }),
  
  Port: Type.Integer({ 
    minimum: 1,
    maximum: 65535,
  }),
  
  Percentage: Type.Number({ 
    minimum: 0,
    maximum: 100,
  }),
  
  SemVer: Type.RegExp(/^\d+\.\d+\.\d+$/),
  
  IPv4: Type.RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/),
  
  IPv6: Type.RegExp(/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/),
  
  PhoneNumber: Type.RegExp(/^\+?[1-9]\d{1,14}$/),
  
  AlphaNumeric: Type.RegExp(/^[a-zA-Z0-9]+$/),
  
  Slug: Type.RegExp(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}

/**
 * Sanitization helpers
 */
export const Sanitize = {
  email(value: string): string {
    return value.toLowerCase().trim()
  },
  
  url(value: string): string {
    try {
      const url = new URL(value)
      return url.toString()
    } catch {
      return value
    }
  },
  
  html(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  },
  
  sql(value: string): string {
    return value.replace(/['";\\]/g, '')
  },
  
  filename(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, '_')
  },
  
  whitespace(value: string): string {
    return value.trim().replace(/\s+/g, ' ')
  },
}

/**
 * Type-safe environment variable access
 */
export function getEnvVar<T extends TSchema>(
  key: string,
  schema: T,
  defaultValue?: Static<T>
): Static<T> {
  const value = process.env[key]
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  // Parse numbers and booleans
  let parsed: unknown = value
  if (schema.type === 'number' || schema.type === 'integer') {
    parsed = Number(value)
  } else if (schema.type === 'boolean') {
    parsed = value === 'true' || value === '1'
  }
  
  const result = validate(schema, parsed)
  
  if (result.isErr()) {
    throw new Error(
      `Invalid environment variable ${key}: ${result.error.errors.map(e => e.message).join(', ')}`
    )
  }
  
  return result.unwrap()
}

/**
 * Create a validated API endpoint handler
 */
export function createValidatedHandler<
  TBody extends TSchema,
  TQuery extends TSchema,
  TParams extends TSchema,
  TResponse extends TSchema
>(config: {
  body?: TBody
  query?: TQuery
  params?: TParams
  response: TResponse
  handler: (data: {
    body: Static<TBody>
    query: Static<TQuery>
    params: Static<TParams>
  }) => Promise<Static<TResponse>>
}) {
  return async (request: any, reply: any) => {
    // Validate request data
    const bodyResult = config.body 
      ? validate(config.body, request.body)
      : Result.ok({} as Static<TBody>)
      
    const queryResult = config.query
      ? validate(config.query, request.query)
      : Result.ok({} as Static<TQuery>)
      
    const paramsResult = config.params
      ? validate(config.params, request.params)
      : Result.ok({} as Static<TParams>)
    
    // Check for validation errors
    if (bodyResult.isErr()) {
      return reply.code(400).send({
        error: 'Invalid request body',
        details: bodyResult.error.errors,
      })
    }
    
    if (queryResult.isErr()) {
      return reply.code(400).send({
        error: 'Invalid query parameters',
        details: queryResult.error.errors,
      })
    }
    
    if (paramsResult.isErr()) {
      return reply.code(400).send({
        error: 'Invalid path parameters',
        details: paramsResult.error.errors,
      })
    }
    
    // Execute handler
    const response = await config.handler({
      body: bodyResult.unwrap(),
      query: queryResult.unwrap(),
      params: paramsResult.unwrap(),
    })
    
    // Validate response
    const responseResult = validate(config.response, response)
    
    if (responseResult.isErr()) {
      request.log.error({
        error: responseResult.error.errors,
      }, 'Invalid response from handler')
      
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Response validation failed',
      })
    }
    
    return responseResult.unwrap()
  }
}