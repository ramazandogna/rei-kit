import { describe, expect, it } from 'vitest'

import { createI18nRuntime } from '../i18n/runtime'

const en = { greeting: 'Hello {name}' }
const tr = { greeting: 'Merhaba {name}' }

function build() {
  return createI18nRuntime({
    locales: ['en', 'tr'] as const,
    fallback: 'en',
    intlTags: { en: 'en-GB', tr: 'tr-TR' },
    messages: en,
    loaders: { tr: () => Promise.resolve({ default: tr }) },
    storageKey: 'test-locale',
  })
}

describe('createI18nRuntime', () => {
  it('starts on the fallback and interpolates', () => {
    const { t } = build()

    expect(t('greeting', { name: 'Rei' })).toBe('Hello Rei')
  })

  /** The bug this guards: switching before the messages arrive shows English. */
  it('loads a locale before making it active', async () => {
    const runtime = build()
    const preference = runtime.useLocalePreference()

    preference.value = 'tr'
    await runtime.ensureMessages('tr')
    await Promise.resolve()

    expect(runtime.activeLocale.value).toBe('tr')
    expect(runtime.t('greeting', { name: 'Rei' })).toBe('Merhaba Rei')
  })
})
