import { computed, ref, watchEffect } from 'vue'
import { createI18n } from 'vue-i18n'

import { setFormatLocale } from '../utils/format'

/** What the user picked. `system` re-reads the browser on every launch. */
export type LocalePreference<L extends string> = 'system' | L

export interface I18nRuntimeOptions<L extends string, Schema> {
  /** Languages the app ships, in no particular order. */
  locales: readonly L[]
  /** The one that is always loaded, and the fallback when a load fails. */
  fallback: L
  /**
   * BCP 47 tag per locale, for `Intl`.
   *
   * Message lookup only needs the base language, but dates and numbers need a
   * region to be right — `zh` alone would leave the formatter to guess.
   */
  intlTags: Record<L, string>
  /** The fallback's messages, bundled. */
  messages: Schema
  /** The rest, fetched only when they are the one in use. */
  loaders?: Partial<Record<L, () => Promise<{ default: Schema }>>>
  /** Where the choice is stored. Namespace it per app. */
  storageKey?: string
}

/**
 * Builds an i18n runtime around an app's own catalogue.
 *
 * A factory rather than a module singleton because the schema is the app's:
 * typing every locale as `typeof en` is what makes a missing key a build error,
 * and this package has no `en` of its own to type against.
 *
 * @example
 * ```ts
 * export const { i18n, t, useLocalePreference, loadActiveLocale } =
 *   createI18nRuntime({
 *     locales: ['en', 'tr'] as const,
 *     fallback: 'en',
 *     intlTags: { en: 'en-GB', tr: 'tr-TR' },
 *     messages: en,
 *     loaders: { tr: () => import('./locales/tr') },
 *     storageKey: 'myapp-locale',
 *   })
 * ```
 */
export function createI18nRuntime<L extends string, Schema extends Record<string, unknown>>(
  options: I18nRuntimeOptions<L, Schema>,
) {
  const { locales, fallback, intlTags, messages, storageKey = 'rei-locale' } = options

  // Typed rather than defaulted to `{}`, which erases the locale keys and makes
  // `loaders[locale]` an index into an empty object.
  const loaders: Partial<Record<L, () => Promise<{ default: Schema }>>> = options.loaders ?? {}

  function isSupported(value: string): value is L {
    return (locales as readonly string[]).includes(value)
  }

  /**
   * First browser language the app can actually speak.
   *
   * `navigator.languages` is ordered by the user's own preference, so the first
   * match is the best one — not simply the first entry.
   */
  function detectSystemLocale(): L {
    // No browser to ask. The fallback is the right answer on a server: it is
    // the locale whose messages are bundled, so it is the only one that could
    // render without a load.
    //
    // The test is `document`, not `navigator`. Node has shipped a global
    // `navigator` since v21, so `typeof navigator === 'undefined'` is false on
    // a server and this would read the *build machine's* language and bake it
    // into every prerendered page. `document` is the only one of the two that
    // still means "a browser".
    if (typeof document === 'undefined') return fallback

    for (const tag of navigator.languages ?? [navigator.language]) {
      const base = tag.split('-')[0]?.toLowerCase()
      if (base && isSupported(base)) return base
    }

    return fallback
  }

  function readStored(): LocalePreference<L> {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'system' || (stored && isSupported(stored))) return stored
    } catch {
      // Storage blocked; fall through to the system language.
    }

    return 'system'
  }

  const preference = ref<LocalePreference<L>>(readStored())

  const activeLocale = computed<L>(() =>
    preference.value === 'system' ? detectSystemLocale() : (preference.value as L),
  )

  const intlLocale = computed(() => intlTags[activeLocale.value])

  // Only the fallback at construction; the rest arrive through
  // setLocaleMessage.
  const initial = { [fallback]: messages } as Record<string, Record<string, unknown>>

  const i18n = createI18n({
    legacy: false,
    locale: activeLocale.value as string,
    fallbackLocale: fallback as string,
    messages: initial,
  } as unknown as Parameters<typeof createI18n>[0])

  /**
   * A narrow view of the instance.
   *
   * vue-i18n infers its own generics from the messages it is handed, which
   * fights a runtime that is generic over the app's schema. Casting once, here,
   * keeps that fight out of every call site — and the surface below is the
   * whole of what this runtime uses.
   */
  const core = i18n.global as unknown as {
    locale: { value: string }
    setLocaleMessage: (locale: string, messages: Schema) => void
    t: (key: string, named?: Record<string, unknown>) => string
  }

  const loaded = new Set<L>([fallback])

  /**
   * Makes sure a locale's messages are in place before it becomes active.
   *
   * Awaited rather than fired and forgotten: setting the locale first paints one
   * frame of the fallback at every other user, which is the flash a fallback
   * exists to prevent, not cause.
   */
  async function ensureMessages(locale: L): Promise<void> {
    if (loaded.has(locale)) return

    const load = loaders[locale]
    if (!load) return

    try {
      const module = await load()
      core.setLocaleMessage(locale, module.default)
      loaded.add(locale)
    } catch {
      // Offline, or a stale chunk after a deploy. The fallback is loaded and
      // will carry the UI, which beats a blank screen.
    }
  }

  /** Loads whatever the stored preference resolves to. Call before mounting. */
  function loadActiveLocale(): Promise<void> {
    return ensureMessages(activeLocale.value)
  }

  // Keeps vue-i18n, `Intl` and the document in step. `lang` matters beyond
  // tidiness: it drives hyphenation, font fallback and screen readers.
  watchEffect(() => {
    core.locale.value = activeLocale.value
    setFormatLocale(intlLocale.value)

    if (typeof document !== 'undefined') {
      document.documentElement.lang = activeLocale.value
    }
  })

  /** Read and write the language preference. */
  function useLocalePreference() {
    return computed<LocalePreference<L>>({
      get: () => preference.value,
      set: (next) => {
        const resolved = next === 'system' ? detectSystemLocale() : (next as L)

        // Messages first, then the switch — the other order shows the fallback
        // for a frame on the way to the language the user just picked.
        void ensureMessages(resolved).then(() => {
          preference.value = next
        })

        try {
          localStorage.setItem(storageKey, next)
        } catch {
          // Storage blocked; the choice lasts for this session only.
        }
      },
    })
  }

  return {
    i18n,
    /** `t` for code outside a component. Tracks the locale inside a computed. */
    t: core.t,
    activeLocale,
    intlLocale,
    ensureMessages,
    loadActiveLocale,
    useLocalePreference,
  }
}
