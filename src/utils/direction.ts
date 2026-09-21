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
