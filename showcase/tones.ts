import type { Tone } from '../src/index'

/**
 * The one heading tone the showcase uses.
 *
 * `SectionHeading` takes three whole class names rather than a tone's name,
 * because Tailwind reads source as text and a class built at runtime never
 * reaches the stylesheet. The showcase had been passing the string
 * `"neutral"`, which type-checked nowhere it was looked at and left every
 * heading with no tone at all.
 */
export const NEUTRAL: Tone = {
  fill: 'bg-primary',
  card: 'bg-surface/60 border-hair',
  text: 'text-ink-soft',
}
