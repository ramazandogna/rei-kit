import { describe, expect, it } from 'vitest'

import { textDirection } from '../utils/direction'

/**
 * This answer is the switch for every logical property in the kit. Getting
 * it wrong does not throw and does not fail a type-check: it mirrors a
 * whole layout the wrong way, and only for the languages the people writing
 * the tests do not read.
 */
describe('textDirection', () => {
  it('knows the languages written right to left', () => {
    for (const tag of ['ar', 'he', 'fa', 'ur', 'ps', 'ku', 'yi', 'dv']) {
      expect(textDirection(tag)).toBe('rtl')
    }
  })

  it('answers the same for a region as for the language', () => {
    expect(textDirection('ar-EG')).toBe('rtl')
    expect(textDirection('he-IL')).toBe('rtl')
    expect(textDirection('en-GB')).toBe('ltr')
  })

  it('reads the script subtag, which can disagree with the language', () => {
    // Azerbaijani in Arabic script runs right to left; in Latin it does not.
    expect(textDirection('az-Arab-IR')).toBe('rtl')
    expect(textDirection('az-Latn-AZ')).toBe('ltr')
  })

  it('does not care how the tag is cased or joined', () => {
    expect(textDirection('AR-eg')).toBe('rtl')
    expect(textDirection('he_IL')).toBe('rtl')
  })

  it('falls back to left-to-right for anything it does not know', () => {
    // The wrong answer either way, but this one leaves the layout as it was
    // rather than mirroring it on a guess.
    expect(textDirection('')).toBe('ltr')
    expect(textDirection('zz')).toBe('ltr')
    expect(textDirection('tr')).toBe('ltr')
  })

  it('is not fooled by a language that merely starts with an RTL subtag', () => {
    // `arn` is Mapudungun, not Arabic.
    expect(textDirection('arn')).toBe('ltr')
  })
})
