import { describe, expect, it } from 'vitest'

import { nextTick } from 'vue'

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

function buildRtl() {
  return createI18nRuntime({
    locales: ['en', 'ar'] as const,
    fallback: 'en',
    intlTags: { en: 'en-GB', ar: 'ar-EG' },
    messages: en,
    loaders: { ar: () => Promise.resolve({ default: { greeting: 'مرحبا {name}' } }) },
    storageKey: 'test-locale-rtl',
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
  it('tells the document which language it is in', async () => {
    const runtime = build()
    const preference = runtime.useLocalePreference()

    preference.value = 'tr'
    await runtime.ensureMessages('tr')
    await Promise.resolve()
    await nextTick()

    expect(document.documentElement.lang).toBe('tr')
  })

  /**
   * The bug this guards is the widest one in the kit and the quietest: every
   * logical property and every `start`/`end` prop is inert until the
   * document says which way the language runs. Without this an app that
   * added Arabic would render its whole layout mirrored the wrong way, with
   * every check green.
   */
  it('tells the document which way the language runs', async () => {
    const runtime = buildRtl()
    const preference = runtime.useLocalePreference()

    expect(document.documentElement.dir).toBe('ltr')

    preference.value = 'ar'
    await runtime.ensureMessages('ar')
    await Promise.resolve()
    await nextTick()

    expect(document.documentElement.dir).toBe('rtl')
  })

  it('puts the direction back when the language goes back', async () => {
    const runtime = buildRtl()
    const preference = runtime.useLocalePreference()

    preference.value = 'ar'
    await runtime.ensureMessages('ar')
    await Promise.resolve()
    await nextTick()

    preference.value = 'en'
    await Promise.resolve()
    await nextTick()

    expect(document.documentElement.dir).toBe('ltr')
  })
})
