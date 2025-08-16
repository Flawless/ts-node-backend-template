/**
 * Result type for explicit error handling (inspired by Rust)
 * Forces developers to handle errors explicitly
 */

export type Result<T, E = Error> = Ok<T> | Err<E>

export class Ok<T> {
  readonly kind = 'ok' as const
  constructor(public readonly value: T) {}

  isOk(): this is Ok<T> {
    return true
  }

  isErr(): this is Err<never> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  unwrapOr(defaultValue: T): T {
    return this.value
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value))
  }

  mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return this as unknown as Result<T, F>
  }

  andThen<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value)
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: never) => U }): U {
    return handlers.ok(this.value)
  }
}

export class Err<E> {
  readonly kind = 'err' as const
  constructor(public readonly error: E) {}

  isOk(): this is Ok<never> {
    return false
  }

  isErr(): this is Err<E> {
    return true
  }

  unwrap(): never {
    throw this.error
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error))
  }

  andThen<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  match<U>(handlers: { ok: (value: never) => U; err: (error: E) => U }): U {
    return handlers.err(this.error)
  }
}

export const Result = {
  ok<T>(value: T): Ok<T> {
    return new Ok(value)
  },

  err<E>(error: E): Err<E> {
    return new Err(error)
  },

  fromTry<T>(fn: () => T): Result<T, Error> {
    try {
      return new Ok(fn())
    } catch (error) {
      return new Err(error instanceof Error ? error : new Error(String(error)))
    }
  },

  fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    return promise
      .then(value => new Ok(value) as Result<T, Error>)
      .catch(error => new Err(error instanceof Error ? error : new Error(String(error))))
  },

  all<T>(results: Result<T, Error>[]): Result<T[], Error> {
    const values: T[] = []
    
    for (const result of results) {
      if (result.isErr()) {
        return result as unknown as Err<Error>
      }
      values.push(result.unwrap())
    }
    
    return new Ok(values)
  },

  /**
   * Type guard for Result type
   */
  isResult(value: unknown): value is Result<unknown, unknown> {
    return value instanceof Ok || value instanceof Err
  },
}

/**
 * Example usage:
 * 
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return Result.err('Division by zero')
 *   }
 *   return Result.ok(a / b)
 * }
 * 
 * const result = divide(10, 2)
 * 
 * // Pattern matching
 * const value = result.match({
 *   ok: (val) => `Result: ${val}`,
 *   err: (err) => `Error: ${err}`
 * })
 * 
 * // Chaining
 * const doubled = result
 *   .map(x => x * 2)
 *   .andThen(x => divide(x, 5))
 *   .unwrapOr(0)
 */