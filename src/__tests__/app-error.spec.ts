import { describe, expect, it } from 'vitest'

import { AppError, toAppError } from '../index'
import '../supabase/index'

/**
 * The error mapping, which had no test and was wrong for every error.
 *
 * `rei-kit/supabase` registers a mapper that reads a PostgREST failure and
 * turns it into something a screen can act on. It gated on
 * `instanceof PostgrestError`, and supabase-js does not return an instance:
 * the object in `{ data, error }` is a plain object. So the mapper declined
 * every error it existed for, and a message reading `permission denied for
 * table enrollments` — naming the table and the missing grant — was replaced
 * with "Something went wrong." on its way to the reader.
 *
 * Nothing failed. The app showed a sentence, the console showed a 403, and the
 * two could not be connected.
 */

/** What supabase-js actually hands back. Not an instance of anything. */
function postgrest(code: string, message: string, hint: string | null = null) {
  return { code, message, details: null, hint }
}

describe('toAppError, for Supabase', () => {
  it('reads the plain object supabase-js returns', () => {
    const error = toAppError(postgrest('42P01', 'relation "habits" does not exist'))

    expect(error.message).toBe('relation "habits" does not exist')
  })

  it('calls a refusal a refusal', () => {
    // 42501 is insufficient_privilege: the request was understood and not
    // allowed. Telling the reader the app broke sends them to support over a
    // grant.
    const error = toAppError(
      postgrest(
        '42501',
        'permission denied for table enrollments',
        'Grant the required privileges to the current role with: GRANT UPDATE ON public.enrollments TO authenticated;',
      ),
    )

    expect(error.kind).toBe('denied')
  })

  it('keeps the original for the log', () => {
    // The message shown to a reader is deliberately plain. The detail that
    // makes the failure diagnosable has to survive somewhere, and `cause` is
    // where every other error in the kit puts it.
    const raw = postgrest('42501', 'permission denied for table enrollments')

    expect(toAppError(raw).cause).toBe(raw)
  })

  it('still recognises a duplicate and a missing row', () => {
    expect(toAppError(postgrest('23505', 'duplicate key value')).kind).toBe('conflict')
    expect(toAppError(postgrest('PGRST116', 'no rows')).kind).toBe('not-found')
  })

  it('leaves anything that is not a database error alone', () => {
    // The shape test has to be narrow enough that an ordinary object carrying
    // a `code` — a DOMException, a Node error — does not get read as Postgres.
    expect(toAppError({ code: 'ENOENT', message: 'no such file' }).kind).toBe('unknown')
    expect(toAppError(new TypeError('fetch failed')).kind).toBe('network')
    expect(toAppError(new Error('plain')).kind).toBe('unknown')
  })

  it('returns an AppError unchanged', () => {
    const original = new AppError('conflict', 'Already there.')

    expect(toAppError(original)).toBe(original)
  })
})
