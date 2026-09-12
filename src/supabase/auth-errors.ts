import { isAuthError } from '@supabase/supabase-js'

/**
 * The Supabase auth codes a sign-in screen has to have wording for.
 *
 * Exported so an app can assert its locale files cover them. The list is not
 * every code Supabase can send — it is the ones that are the user's to act on,
 * which is the only kind worth a sentence of its own. Everything else is a
 * fault, and a fault reads the same whatever caused it.
 */
export const AUTH_ERROR_CODES = [
  'invalid_credentials',
  'email_not_confirmed',
  'user_already_exists',
  'email_exists',
  'weak_password',
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'signup_disabled',
  'user_banned',
] as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]

export type AuthMessageKeyOptions = {
  /**
   * Codes this app has wording for beyond the shared list.
   *
   * A key is only an improvement on the generic message if something
   * translates it, so widening the list is the app's decision and not the
   * kit's: an app that has not written `authError.validation_failed` is better
   * served by the sentence it has than by a key rendered raw on screen.
   */
  extraCodes?: readonly string[] | undefined
  /** The key returned when nothing matches. */
  fallback?: string | undefined
}

/**
 * Maps an auth failure to a message key.
 *
 * Returns a key rather than a sentence so the caller translates it at render
 * time — an error stored before a language switch still reads correctly after,
 * which is the whole reason this returns a string that looks unfinished.
 *
 * Recognising a Supabase error is Supabase's business, so the type guard stays
 * on this side of the boundary and the caller only ever sees a key.
 *
 * @example
 * ```ts
 * serverError.value = toAuthMessageKey(error) // 'authError.invalid_credentials'
 * // <p>{{ $t(serverError) }}</p>
 * ```
 */
export function toAuthMessageKey(error: unknown, options: AuthMessageKeyOptions = {}): string {
  const { extraCodes = [], fallback = 'authError.generic' } = options

  if (!isAuthError(error)) return fallback

  const code = error.code
  if (!code) return fallback

  const known = (AUTH_ERROR_CODES as readonly string[]).includes(code) || extraCodes.includes(code)

  return known ? `authError.${code}` : fallback
}
