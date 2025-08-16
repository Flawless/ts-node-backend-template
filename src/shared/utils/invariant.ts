/**
 * Runtime assertion that ALWAYS enforces constraints
 * Throws in ALL environments to prevent invalid states
 * Production gets additional monitoring/alerting
 */
export function invariant(
  condition: unknown,
  message: string,
  context?: Record<string, unknown>
): asserts condition {
  if (condition) {
    return
  }

  const error = new Error(message)
  const errorWithContext = Object.assign(error, {
    code: 'INVARIANT_VIOLATION',
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    severity: 'critical',
  })

  // Log to monitoring in production for alerting
  if (process.env.NODE_ENV === 'production') {
    // Send critical alert to monitoring service
    console.error('CRITICAL INVARIANT VIOLATION:', {
      message,
      context,
      stack: error.stack,
      alert: 'page-oncall-team',
    })
  }

  // ALWAYS throw - no environment can bypass safety checks
  throw errorWithContext
}

/**
 * Type-safe assertion with compile-time checks
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  invariant(value !== null && value !== undefined, message)
}

/**
 * Ensure a value is never reached (exhaustive checks)
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

/**
 * CI/Test environment assertion
 * Enforces in CI, test, and development environments
 * Only relaxes in production (with monitoring)
 */
export function ciAssert(
  condition: unknown,
  message: string
): asserts condition {
  const isCI = process.env.CI === 'true'
  const isTest = process.env.NODE_ENV === 'test'
  const isDev = process.env.NODE_ENV === 'development'
  const isStaging = process.env.NODE_ENV === 'staging'
  
  // Enforce in all non-production environments
  if (isCI || isTest || isDev || isStaging) {
    invariant(condition, message)
  } else if (!condition) {
    // In production, still alert but don't crash
    console.error('CI_ASSERT_VIOLATION_IN_PRODUCTION:', {
      message,
      shouldNotHappen: true,
      severity: 'high',
    })
  }
}

/**
 * Assert environment variable exists and is valid
 */
export function assertEnvVar(
  key: string,
  validator?: (value: string) => boolean
): string {
  const value = process.env[key]
  
  invariant(value, `Missing required environment variable: ${key}`)
  
  if (validator && !validator(value)) {
    throw new Error(`Invalid environment variable ${key}: ${value}`)
  }
  
  return value
}

/**
 * Assert a number is within range
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  name: string
): void {
  invariant(
    value >= min && value <= max,
    `${name} must be between ${min} and ${max}, got ${value}`
  )
}

/**
 * Assert array is not empty
 */
export function assertNonEmpty<T>(
  array: T[],
  name: string
): asserts array is [T, ...T[]] {
  invariant(array.length > 0, `${name} cannot be empty`)
}

/**
 * Assert string matches pattern
 */
export function assertPattern(
  value: string,
  pattern: RegExp,
  name: string
): void {
  invariant(
    pattern.test(value),
    `${name} does not match required pattern: ${pattern}`
  )
}

/**
 * Type guard for safe type narrowing
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Safe JSON parsing with validation
 */
export function safeJsonParse<T>(
  json: string,
  validator: (value: unknown) => value is T
): T {
  try {
    const parsed = JSON.parse(json)
    invariant(validator(parsed), 'Invalid JSON structure')
    return parsed
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}