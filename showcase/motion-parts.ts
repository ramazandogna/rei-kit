/**
 * The parts of rei-kit/motion as the page presents them: one heading each,
 * one sentence on what it is for. Shared by the section and the menu, so a
 * part cannot be on the page and missing from the way to it.
 */
export const MOTION_PARTS = [
  {
    id: 'motion-ticker',
    label: 'NumberTicker',
    title: 'NumberTicker — a counter that rolls',
    pitch:
      'Each digit turns over on its own, like a note counter. For a balance, a score or anything that changes while someone is watching it.',
  },
  {
    id: 'motion-count',
    label: 'CountUp',
    title: 'CountUp — a figure that counts in',
    pitch:
      'Passes through every value on the way and waits until it is on screen. For the numbers on a landing page, decimals included.',
  },
  {
    id: 'motion-rotate',
    label: 'TextRotate',
    title: 'TextRotate — one word that keeps changing',
    pitch:
      'Swaps a word in the middle of a sentence. Holds still while hovered, and does not move at all for readers who asked for less.',
  },
  {
    id: 'motion-type',
    label: 'TypeWriter',
    title: 'TypeWriter — a line that types itself',
    pitch:
      'Types, holds, deletes and moves to the next line. A screen reader hears the whole line, never half a word.',
  },
  {
    id: 'motion-reveal',
    label: 'BaseReveal',
    title: 'BaseReveal — content that arrives',
    pitch:
      'Fades or rises into view as it scrolls in; give each item a growing delay for a stagger. Never hidden where JavaScript has not run.',
  },
  {
    id: 'motion-marquee',
    label: 'BaseMarquee',
    title: 'BaseMarquee — a row without end',
    pitch:
      'Logos, testimonials, a ticker. Seamless without measuring anything, paused on hover, and a plain scrollable row for readers who asked for less motion.',
  },
  {
    id: 'motion-shimmer',
    label: 'text-shimmer',
    title: 'text-shimmer — a headline that catches the light',
    pitch:
      'One class on a heading. A band of light crosses it in the palette’s own colours; two variables turn it into your brand.',
  },
  {
    id: 'motion-attention',
    label: 'Attention effects',
    title: 'Attention effects — float, pulse, glow, wiggle, pop',
    pitch:
      'Five small loops for the one thing on a screen that should be noticed. Use one at a time: a page where everything moves has nothing that stands out.',
  },
] as const

export type MotionPartId = (typeof MOTION_PARTS)[number]['id']
