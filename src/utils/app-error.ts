/** Error categories the UI can branch on, independent of Postgres or Supabase. */
export type AppErrorKind = 'conflict' | 'not-found' | 'network' | 'unknown'

/**
 * A normalised error thrown by the data layer.
 *
 * Extends `Error` so it can be thrown, caught and logged like any other error,
 * and keeps the original in `cause` for debugging.
 *
 * @example
 * ```ts
 * try {
 *   await createHabit(input)
 * } catch (e) {
 *   const err = toAppError(e)
 *   if (err.kind === 'conflict') return // already exists, not a real failure
 *   showToast(err.message)
 * }
 * ```
 */
export class AppError extends Error {
  readonly kind: AppErrorKind

  constructor(kind: AppErrorKind, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AppError'
    this.kind = kind
  }
}

/**
 * Normalises anything thrown by Supabase into an {@link AppError}.
 *
 * Idempotent: an `AppError` is returned as-is, so wrapping twice is safe.
 *
 * @param error - Anything caught from the data layer.
 * @returns An `AppError` with a user-facing message and a `kind` to branch on.
 */
/**
 * Turns a backend-specific error into an `AppError`, or returns `null` to let
 * the next mapper try.
 */
export type ErrorMapper = (error: unknown) => AppError | null

const mappers: ErrorMapper[] = []

/**
 * Teaches `toAppError` about a backend it does not import.
 *
 * The core has no database dependency; `rei-kit/supabase` registers the
 * Postgrest mapping when it is imported, so an app that never touches Supabase
 * never downloads the code that knows about it.
 *
 * @example
 * ```ts
 * registerErrorMapper((error) =>
 *   isPrismaConflict(error) ? new AppError('conflict', 'Already exists.') : null,
 * )
 * ```
 */
export function registerErrorMapper(mapper: ErrorMapper): void {
  mappers.push(mapper)
}

/**
 * Normalises anything thrown by the data layer.
 *
 * @param error - Whatever was caught.
 * @returns An `AppError`, never a rethrow.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error

  for (const map of mappers) {
    const mapped = map(error)
    if (mapped) return mapped
  }

  // A failed fetch surfaces as a TypeError, which is the only reliable signal
  // the browser gives that the request never left.
  if (error instanceof TypeError) {
    return new AppError('network', 'Could not reach the server.', { cause: error })
  }

  return new AppError('unknown', 'Something went wrong.', { cause: error })
}
