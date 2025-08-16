/**
 * Runtime boundary checks that prevent invalid operations
 * These checks CANNOT be disabled and run in ALL environments
 */

import { logger } from '../utils/logger.js'

export class BoundaryViolationError extends Error {
  constructor(
    message: string,
    public readonly boundary: string,
    public readonly context?: unknown
  ) {
    super(message)
    this.name = 'BoundaryViolationError'
  }
}

/**
 * Array boundary check - prevents out of bounds access
 */
export function safeArrayAccess<T>(
  array: readonly T[],
  index: number,
  name = 'array'
): T {
  if (!Number.isInteger(index)) {
    throw new BoundaryViolationError(
      `Index must be an integer, got ${typeof index}`,
      'array-index-type',
      { name, index }
    )
  }
  
  if (index < 0 || index >= array.length) {
    throw new BoundaryViolationError(
      `Index ${index} out of bounds for ${name} with length ${array.length}`,
      'array-bounds',
      { name, index, length: array.length }
    )
  }
  
  return array[index]!
}

/**
 * Number boundary check - prevents overflow/underflow
 */
export function safeNumber(
  value: number,
  min: number,
  max: number,
  name = 'value'
): number {
  if (!Number.isFinite(value)) {
    throw new BoundaryViolationError(
      `${name} must be a finite number, got ${value}`,
      'number-finite',
      { name, value }
    )
  }
  
  if (value < min || value > max) {
    throw new BoundaryViolationError(
      `${name} must be between ${min} and ${max}, got ${value}`,
      'number-range',
      { name, value, min, max }
    )
  }
  
  return value
}

/**
 * String length boundary check
 */
export function safeString(
  value: string,
  maxLength: number,
  name = 'string'
): string {
  if (typeof value !== 'string') {
    throw new BoundaryViolationError(
      `${name} must be a string, got ${typeof value}`,
      'string-type',
      { name, type: typeof value }
    )
  }
  
  if (value.length > maxLength) {
    throw new BoundaryViolationError(
      `${name} exceeds maximum length of ${maxLength}, got ${value.length}`,
      'string-length',
      { name, length: value.length, maxLength }
    )
  }
  
  return value
}

/**
 * Collection size boundary check
 */
export function safeCollectionSize<T>(
  collection: T[] | Set<T> | Map<unknown, T>,
  maxSize: number,
  name = 'collection'
): void {
  const size = Array.isArray(collection) 
    ? collection.length 
    : collection.size
  
  if (size > maxSize) {
    throw new BoundaryViolationError(
      `${name} exceeds maximum size of ${maxSize}, got ${size}`,
      'collection-size',
      { name, size, maxSize }
    )
  }
}

/**
 * Recursion depth guard
 */
export class RecursionGuard {
  private depth = 0
  private readonly maxDepth: number
  private readonly name: string
  
  constructor(maxDepth = 100, name = 'function') {
    this.maxDepth = maxDepth
    this.name = name
  }
  
  enter(): void {
    this.depth++
    
    if (this.depth > this.maxDepth) {
      throw new BoundaryViolationError(
        `Maximum recursion depth ${this.maxDepth} exceeded in ${this.name}`,
        'recursion-depth',
        { name: this.name, depth: this.depth, maxDepth: this.maxDepth }
      )
    }
  }
  
  exit(): void {
    this.depth--
  }
  
  guard<T>(fn: () => T): T {
    this.enter()
    try {
      return fn()
    } finally {
      this.exit()
    }
  }
  
  async guardAsync<T>(fn: () => Promise<T>): Promise<T> {
    this.enter()
    try {
      return await fn()
    } finally {
      this.exit()
    }
  }
}

/**
 * Loop iteration guard - prevents infinite loops
 */
export class LoopGuard {
  private iterations = 0
  private readonly maxIterations: number
  private readonly name: string
  private readonly startTime = Date.now()
  private readonly maxDuration: number
  
  constructor(
    maxIterations = 10000,
    maxDurationMs = 5000,
    name = 'loop'
  ) {
    this.maxIterations = maxIterations
    this.maxDuration = maxDurationMs
    this.name = name
  }
  
  check(): void {
    this.iterations++
    
    if (this.iterations > this.maxIterations) {
      throw new BoundaryViolationError(
        `Maximum iterations ${this.maxIterations} exceeded in ${this.name}`,
        'loop-iterations',
        { name: this.name, iterations: this.iterations }
      )
    }
    
    const elapsed = Date.now() - this.startTime
    if (elapsed > this.maxDuration) {
      throw new BoundaryViolationError(
        `Maximum duration ${this.maxDuration}ms exceeded in ${this.name}`,
        'loop-duration',
        { name: this.name, duration: elapsed }
      )
    }
  }
  
  reset(): void {
    this.iterations = 0
  }
}

/**
 * Concurrency limiter - prevents resource exhaustion
 */
export class ConcurrencyGuard {
  private active = 0
  private readonly maxConcurrent: number
  private readonly name: string
  private readonly queue: Array<() => void> = []
  
  constructor(maxConcurrent = 10, name = 'operation') {
    this.maxConcurrent = maxConcurrent
    this.name = name
  }
  
  async acquire(): Promise<void> {
    if (this.active >= this.maxConcurrent) {
      // Wait for a slot to become available
      await new Promise<void>(resolve => {
        this.queue.push(resolve)
      })
    }
    
    this.active++
  }
  
  release(): void {
    this.active--
    
    // Process next in queue if any
    const next = this.queue.shift()
    if (next) {
      next()
    }
  }
  
  async guard<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
  
  getStats(): { active: number; queued: number; maxConcurrent: number } {
    return {
      active: this.active,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    }
  }
}

/**
 * Rate limiter - prevents excessive operations
 */
export class RateGuard {
  private tokens: number
  private lastRefill = Date.now()
  
  constructor(
    private readonly maxTokens: number,
    private readonly refillRate: number, // tokens per second
    private readonly name = 'operation'
  ) {
    this.tokens = maxTokens
  }
  
  async acquire(cost = 1): Promise<void> {
    this.refill()
    
    if (this.tokens < cost) {
      const waitTime = ((cost - this.tokens) / this.refillRate) * 1000
      
      if (waitTime > 60000) {
        throw new BoundaryViolationError(
          `Rate limit exceeded for ${this.name}, would need to wait ${Math.round(waitTime / 1000)}s`,
          'rate-limit',
          { name: this.name, waitTime }
        )
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.refill()
    }
    
    this.tokens -= cost
  }
  
  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsed * this.refillRate
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
  
  getTokens(): number {
    this.refill()
    return this.tokens
  }
}

/**
 * Global boundary monitor
 */
export class BoundaryMonitor {
  private static violations: BoundaryViolationError[] = []
  private static readonly maxViolations = 100
  
  static recordViolation(error: BoundaryViolationError): void {
    this.violations.push(error)
    
    // Keep only recent violations
    if (this.violations.length > this.maxViolations) {
      this.violations.shift()
    }
    
    // Log for monitoring
    logger.error({
      boundary: error.boundary,
      message: error.message,
      context: error.context,
      stack: error.stack,
    }, 'Boundary violation detected')
  }
  
  static getViolations(): BoundaryViolationError[] {
    return [...this.violations]
  }
  
  static getStats(): {
    total: number
    byBoundary: Record<string, number>
  } {
    const byBoundary: Record<string, number> = {}
    
    for (const violation of this.violations) {
      byBoundary[violation.boundary] = (byBoundary[violation.boundary] ?? 0) + 1
    }
    
    return {
      total: this.violations.length,
      byBoundary,
    }
  }
  
  static clear(): void {
    this.violations = []
  }
}

// Automatically record all boundary violations
process.on('uncaughtException', (error) => {
  if (error instanceof BoundaryViolationError) {
    BoundaryMonitor.recordViolation(error)
  }
})

process.on('unhandledRejection', (reason) => {
  if (reason instanceof BoundaryViolationError) {
    BoundaryMonitor.recordViolation(reason)
  }
})