import { createClient } from '@supabase/supabase-js'
import { PostgrestError } from '@supabase/supabase-js'
import type { SupabaseClient, SupportedStorage } from '@supabase/supabase-js'

import { AppError, registerErrorMapper } from '../utils/app-error'

/**
 * The optional Supabase entry.
 *
 * Behind its own export so an app that never touches Supabase downloads none of
 * it — importing this module is what opts in, including to the error mapping
 * registered at the bottom.
 */

const REMEMBER_KEY = 'rei-remember'

/**
 * Records whether the next session should outlive the tab.
 *
 * Call before signing in: the SDK writes the session as soon as the request
 * succeeds, and this decides where it lands.
 */
export function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, String(remember))
  } catch {
    // Storage blocked; the session will simply not persist.
  }
}

function activeStore(): Storage {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'false' ? sessionStorage : localStorage
  } catch {
    return sessionStorage
  }
}

/**
 * Session storage that follows the "remember me" choice.
 *
 * Supabase issues a short-lived access token plus a long-lived refresh token.
 * Where the refresh token is kept decides how long a login survives:
 * `localStorage` outlives the browser, `sessionStorage` dies with the tab. On a
 * shared machine that difference is the whole point, so the choice switches the
 * store rather than the token lifetime.
 *
 * Removal clears both, so signing out cannot leave a copy behind.
 */
const rememberAwareStorage: SupportedStorage = {
  getItem: (key) => {
    try {
      return activeStore().getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      activeStore().setItem(key, value)
    } catch {
      // Storage blocked.
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    } catch {
      // Storage blocked.
    }
  },
}

/**
 * Builds a typed Supabase client with the remember-me storage wired in.
 *
 * A factory, not a module singleton reading `import.meta.env`: a package cannot
 * know what an app calls its environment variables, and a second app would have
 * different ones.
 *
 * @param url - Project URL. Public; it is the API endpoint.
 * @param anonKey - Anon key. Also public — row-level security is the boundary,
 *   not the key.
 *
 * @example
 * ```ts
 * export const supabase = createSupabaseClient<Database>(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY,
 * )
 * ```
 */
export function createSupabaseClient<Database>(
  url: string,
  anonKey: string,
): SupabaseClient<Database> {
  if (!url) throw new Error('createSupabaseClient: the project URL is missing.')
  if (!anonKey) throw new Error('createSupabaseClient: the anon key is missing.')

  return createClient<Database>(url, anonKey, { auth: { storage: rememberAwareStorage } })
}

/**
 * Teaches `toAppError` to read Postgres.
 *
 * Registered on import rather than exported as a step to remember: importing
 * this module is already the decision to use Supabase.
 */
registerErrorMapper((error) => {
  if (!(error instanceof PostgrestError)) return null

  // 23505 is unique_violation — a second row where the schema allows one. It is
  // a normal outcome of a double tap, not a failure worth an error screen.
  if (error.code === '23505') {
    return new AppError('conflict', 'That already exists.', { cause: error })
  }

  if (error.code === 'PGRST116') {
    return new AppError('not-found', 'That could not be found.', { cause: error })
  }

  return new AppError('unknown', error.message, { cause: error })
})
