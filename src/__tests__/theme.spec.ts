import { beforeEach, describe, expect, it } from 'vitest'

import { applyTheme, isThemePreference, readStoredTheme } from '../composables/use-theme'

/**
 * The environment this runs in is the test.
 *
 * jsdom gives a document and no `matchMedia`, which is the combination that
 * broke a consumer: `applyTheme` guarded on `document` and then reached for
 * `window.matchMedia`, so every component test that mounted anything using the
 * theme threw. Having a document does not imply having `matchMedia` — some
 * embedded webviews are the same — so the two are checked separately now.
 */
describe('applyTheme without matchMedia', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    // Removed rather than stubbed: stubbing it would test the stub.
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('does not throw', () => {
    expect(() => applyTheme('system')).not.toThrow()
  })

  it('treats an unanswerable "system" as light', () => {
    applyTheme('system')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('still honours an explicit choice, which needs nothing to ask', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('readStoredTheme', () => {
  it('falls back to system when storage holds nothing usable', () => {
    localStorage.removeItem('rei-theme')
    expect(readStoredTheme()).toBe('system')

    localStorage.setItem('rei-theme', 'nonsense')
    expect(readStoredTheme()).toBe('system')
  })

  it('reads back a stored choice', () => {
    localStorage.setItem('rei-theme', 'dark')
    expect(readStoredTheme()).toBe('dark')
  })
})

describe('isThemePreference', () => {
  it('accepts the three it knows and nothing else', () => {
    for (const value of ['system', 'light', 'dark']) expect(isThemePreference(value)).toBe(true)
    for (const value of ['', 'Dark', null, 0]) expect(isThemePreference(value)).toBe(false)
  })
})
