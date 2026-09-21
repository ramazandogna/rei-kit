/** Which way a language is written. */
export type TextDirection = 'ltr' | 'rtl'

/*
 * The language subtags written right to left.
 *
 * A list rather than `Intl.Locale.prototype.getTextInfo()`, which is recent,
 * was a property before it was a method, and is missing or differently
 * spelled depending on the engine. Feature-detecting three spellings to
 * answer a question with twelve possible answers is more code and more ways
 * to be wrong than the list, and the list does not change: a language does
 * not switch direction.
 */
const RTL = new Set([
  'ar', // Arabic
  'arc', // Aramaic
  'ckb', // Central Kurdish
  'dv', // Divehi
  'fa', // Persian
  'he', // Hebrew
  'ks', // Kashmiri
  'ku', // Kurdish
  'nqo', // N'Ko
  'ps', // Pashto
  'sd', // Sindhi
  'syr', // Syriac
  'ug', // Uyghur
  'ur', // Urdu
  'yi', // Yiddish
])

/**
 * Which way a locale tag is written.
 *
 * The kit is built on logical properties and `start`/`end` props all the
 * way through — `BaseDrawer`'s side, every inset, every margin — and none
 * of that does anything at all until `dir` is set on the document. So the
 * direction has to come from somewhere, and a locale tag is the only thing
 * that knows it.
 *
 * Only the language subtag is read, so `ar-EG` and `ar` answer the same.
 *
 * @example
 * ```ts
 * textDirection('he-IL') // 'rtl'
 * textDirection('tr') // 'ltr'
 * ```
 */
export function textDirection(locale: string): TextDirection {
  // `und-Arab` and the like are a real spelling, so the script subtag is
  // worth the two lines it costs.
  const parts = locale.toLowerCase().split(/[-_]/)
  const script = parts[1]

  if (script === 'arab' || script === 'hebr' || script === 'thaa' || script === 'syrc') return 'rtl'

  return RTL.has(parts[0] ?? '') ? 'rtl' : 'ltr'
}

/**
 * Which way the text around an element runs.
 *
 * The companion to `textDirection`, and the other end of it: that one asks
 * a locale, this one asks the page. An element inside a quoted passage may
 * run the other way from the document it is in, so the nearest `dir`
 * attribute wins and the document is the fallback.
 *
 * The attribute rather than `getComputedStyle().direction`: the computed
 * value is the real answer, but it is inherited through the cascade, and
 * jsdom does not inherit it — so the tests that exist to prove the
 * right-to-left behaviour would all pass with the behaviour removed. What
 * actually sets the direction in this kit is the attribute, in one place,
 * on `<html>`, written by `createI18nRuntime`.
 */
export function elementDirection(from: Element | null | undefined): TextDirection {
  const declared = from?.closest('[dir]')?.getAttribute('dir') ?? document.dir

  return declared === 'rtl' ? 'rtl' : 'ltr'
}

/**
 * `ArrowLeft` and `ArrowRight` as a direction of travel: `-1` back through
 * a list, `1` on through it, `0` for any other key.
 *
 * They are mirrored where the writing is, which is not a nicety — it is the
 * whole of what the arrows mean. A row of tabs in Arabic runs right to
 * left, so the tab to the *left* of the current one is the next one, and a
 * handler that reads `ArrowRight` as "forward" walks backwards through
 * every roving-tabindex control in the kit at once. WAI-ARIA says so
 * explicitly, and it is invisible to every check: the code type-checks, the
 * styles are all logical, and the keys are the same keys.
 *
 * @example
 * ```ts
 * function onKeydown(event: KeyboardEvent) {
 *   const step = horizontalStep(event.key, event.currentTarget as Element)
 *   if (step === 0) return
 *   event.preventDefault()
 *   moveTo(index + step)
 * }
 * ```
 */
export function horizontalStep(key: string, from: Element | null | undefined): -1 | 0 | 1 {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return 0

  const forward = elementDirection(from) === 'rtl' ? 'ArrowLeft' : 'ArrowRight'

  return key === forward ? 1 : -1
}
