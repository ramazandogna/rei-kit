import { ref } from 'vue'

/**
 * The locale `Intl` formatting uses.
 *
 * Held here rather than imported from an i18n runtime so the utilities have no
 * i18n dependency at all: an app that never installs vue-i18n still gets dates
 * in the right language. `createI18nRuntime` sets this when it is used.
 */
const locale = ref<string>(typeof navigator === 'undefined' ? 'en' : (navigator.language ?? 'en'))

/**
 * Points every formatter at a new locale.
 *
 * @example
 * ```ts
 * setFormatLocale('tr-TR')
 * ```
 */
export function setFormatLocale(next: string): void {
  locale.value = next
}

/**
 * `Intl.DateTimeFormat` is expensive to construct, so instances are cached per
 * locale and option set. The key includes the locale, which is what lets the
 * cache survive a language change instead of returning stale formatters.
 */
const cache = new Map<string, Intl.DateTimeFormat>()

/**
 * Formats a date in the active locale.
 *
 * Reading the locale ref here is deliberate: called from a `computed`, the
 * result re-evaluates when the language changes.
 *
 * @param date - Date to format.
 * @param options - Passed straight to `Intl.DateTimeFormat`.
 *
 * @example
 * ```ts
 * formatDate(new Date(), { weekday: 'narrow' }) // 'T'
 * ```
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  const tag = locale.value
  const key = `${tag}:${JSON.stringify(options)}`

  let formatter = cache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, options)
    cache.set(key, formatter)
  }

  return formatter.format(date)
}
