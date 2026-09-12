import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { AuthForm, fieldErrors } from '../app/index'
import { AUTH_ERROR_CODES, toAuthMessageKey } from '../supabase/auth-errors'

/**
 * The auth pack.
 *
 * Three apps had written a sign-in form, and two of them had written it twice.
 * The copies had already drifted — the error colour, the placeholder, whether
 * the button changed its wording while busy — which is what a component that
 * exists in four places does over a few months.
 */

const labels = {
  email: 'E-mail',
  password: 'Password',
  confirmPassword: 'Confirm password',
  submit: 'Sign in',
  google: 'Continue with Google',
  or: 'or',
  rememberMe: 'Remember me',
}

function form(props: Record<string, unknown> = {}) {
  return mount(AuthForm, { props: { mode: 'signIn', labels, ...props } })
}

describe('toAuthMessageKey', () => {
  // An object shaped like a Supabase AuthError. `isAuthError` checks the
  // prototype chain, so a plain object is deliberately NOT one -- which is the
  // fallback case below.
  const authError = (code: string) =>
    Object.assign(new Error('nope'), {
      code,
      name: 'AuthApiError',
      status: 400,
      __isAuthError: true,
    })

  it('returns a key rather than a sentence', () => {
    // The whole reason this function exists: an error stored before a language
    // switch still reads correctly after it.
    expect(toAuthMessageKey(authError('invalid_credentials'))).toBe('authError.invalid_credentials')
  })

  it('falls back for a code nothing has wording for', () => {
    // A key with no translation renders raw on screen, which is worse than the
    // generic sentence. So an unknown code is not passed through.
    expect(toAuthMessageKey(authError('some_new_code_2027'))).toBe('authError.generic')
  })

  it('lets an app widen the list it has wording for', () => {
    // kakehashi has Turkish wording for `validation_failed`; the others do not.
    expect(toAuthMessageKey(authError('validation_failed'))).toBe('authError.generic')
    expect(
      toAuthMessageKey(authError('validation_failed'), { extraCodes: ['validation_failed'] }),
    ).toBe('authError.validation_failed')
  })

  it('falls back for anything that is not an auth error at all', () => {
    expect(toAuthMessageKey(new Error('network'))).toBe('authError.generic')
    expect(toAuthMessageKey(null)).toBe('authError.generic')
    expect(toAuthMessageKey({ code: 'invalid_credentials' })).toBe('authError.generic')
  })

  it('publishes the codes so an app can test its locale files cover them', () => {
    expect(AUTH_ERROR_CODES).toContain('invalid_credentials')
    expect(AUTH_ERROR_CODES).toContain('email_exists')
  })
})

describe('fieldErrors', () => {
  const schema = {
    safeParse: (values: unknown) => {
      const v = values as { email: string; password: string }
      const issues = []
      if (!v.email.includes('@')) issues.push({ path: ['email'], message: 'Bad e-mail' })
      if (v.password.length < 8) issues.push({ path: ['password'], message: 'Too short' })
      // A second issue on a field that already has one.
      if (['short', 'password'].includes(v.password))
        issues.push({ path: ['password'], message: 'Too obvious' })

      return issues.length
        ? { success: false as const, error: { issues } }
        : { success: true as const }
    },
  }

  it('returns null when the values are good, so `if (errors)` is the guard', () => {
    expect(fieldErrors(schema, { email: 'a@b.co', password: 'longenough' })).toBeNull()
  })

  it('flattens the tree to one message per field', () => {
    expect(fieldErrors(schema, { email: 'nope', password: 'short' })).toEqual({
      email: 'Bad e-mail',
      password: 'Too short',
    })
  })

  it('keeps the first message for a field, not the last', () => {
    // A field shows one message and the first is the one the reader can act on.
    const found = fieldErrors(schema, { email: 'a@b.co', password: 'short' })
    expect(found).toEqual({ password: 'Too short' })
  })

  it('still stops the caller when every issue is at the root', () => {
    // A `refine` with no path. Reporting "valid" here would let a broken
    // submission through.
    const rootOnly = {
      safeParse: () => ({
        success: false as const,
        error: { issues: [{ path: [], message: 'no' }] },
      }),
    }

    expect(fieldErrors(rootOnly, {})).toEqual({})
    expect(fieldErrors(rootOnly, {})).not.toBeNull()
  })
})

describe('AuthForm', () => {
  it('collects no confirm field on sign-in and one on sign-up', () => {
    expect(form().findAll('input[type="password"]')).toHaveLength(1)
    expect(form({ mode: 'signUp' }).findAll('input[type="password"]')).toHaveLength(2)
  })

  it('shows remember-me on sign-in only, and only where there are words for it', () => {
    // A brand-new account has nothing to remember.
    expect(form().find('input[type="checkbox"]').exists()).toBe(true)
    expect(form({ mode: 'signUp' }).find('input[type="checkbox"]').exists()).toBe(false)

    const { rememberMe: _rememberMe, ...rest } = labels
    expect(form({ labels: rest }).find('input[type="checkbox"]').exists()).toBe(false)
  })

  it('emits the values rather than signing anybody in', async () => {
    const w = form()

    await w.find('input[type="email"]').setValue('a@b.co')
    await w.find('input[type="password"]').setValue('longenough')
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')?.[0]).toEqual([
      { email: 'a@b.co', password: 'longenough', confirmPassword: '' },
    ])
  })

  it('does not emit when validation fails, and shows the messages', async () => {
    const w = form({ validate: () => ({ email: 'Bad e-mail' }) })

    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeUndefined()
    expect(w.text()).toContain('Bad e-mail')
  })

  it('does not carry a confirm value into a sign-in submission', async () => {
    // Typing a confirmation on sign-up and switching to sign-in must not
    // validate a field that is no longer on screen.
    const w = form({ mode: 'signUp' })

    await w.findAll('input[type="password"]')[1]!.setValue('typed')
    await w.setProps({ mode: 'signIn' })
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')?.[0]?.[0]).toMatchObject({ confirmPassword: '' })
  })

  it('clears a stale error when the mode changes', async () => {
    const w = form({ validate: () => ({ email: 'Bad e-mail' }) })

    await w.find('form').trigger('submit')
    expect(w.text()).toContain('Bad e-mail')

    await w.setProps({ mode: 'signUp' })
    await nextTick()
    expect(w.text()).not.toContain('Bad e-mail')
  })

  it('announces a server failure assertively', () => {
    // On screen this is a red box; in a screen reader it has to interrupt,
    // because the reader cannot carry on without it.
    const w = form({ error: 'Those details did not match.' })
    const alert = w.find('[role="alert"]')

    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Those details did not match.')
  })

  it('changes the submit wording while busy, and only if given wording', async () => {
    expect(form({ busy: true }).find('button[type="submit"]').text()).toContain('Sign in')
    expect(
      form({ busy: true, labels: { ...labels, submitBusy: 'Signing in…' } })
        .find('button[type="submit"]')
        .text(),
    ).toContain('Signing in…')
  })

  it('disables the Google button while a sign-in is already in flight', () => {
    const google = form({ busy: true }).findAll('button')[0]!

    expect(google.attributes('disabled')).toBeDefined()
  })

  it('renders no OAuth block for an app that has none', () => {
    const { google: _google, or: _or, ...rest } = labels
    const w = form({ labels: rest })

    expect(w.findAll('button')).toHaveLength(1)
    // The "or" divider is what separates the two ways in; with one way in,
    // there is nothing to separate.
    expect(w.find('.bg-hair').exists()).toBe(false)
  })
})
