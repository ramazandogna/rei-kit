/**
 * Catalog card art: one tiny SVG symbol per category, plus a few bespoke ones
 * for flagship parts. Drawn once as a sprite and referenced with `<use>`, so a
 * card costs two nodes. Colours are theme tokens (inherited into the `<use>`
 * tree), so palettes, dark mode and materials restyle every drawing.
 */
const P = 'fill:var(--color-primary)'
const A = 'fill:var(--color-accent, var(--color-primary))'
const S = 'fill:var(--color-surface);stroke:var(--color-hair);stroke-width:1'
const I = 'fill:var(--color-ink)'
const H = 'fill:var(--color-hair)'
const SOFT = 'fill:color-mix(in oklab, var(--color-primary) 18%, transparent)'
const LINE =
  'fill:none;stroke:var(--color-primary);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round'
const LINE2 =
  'fill:none;stroke:var(--color-accent, var(--color-primary));stroke-width:2;stroke-linecap:round;opacity:.7'

const r = (x: number, y: number, w: number, h: number, s: string, rx = 4) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" style="${s}"/>`
const c = (x: number, y: number, rr: number, s: string) =>
  `<circle cx="${x}" cy="${y}" r="${rr}" style="${s}"/>`
const p = (d: string, s: string) => `<path d="${d}" style="${s}"/>`

const ART: Record<string, string> = {
  Actions:
    r(30, 32, 64, 26, P, 13) +
    r(42, 43, 40, 4, 'fill:var(--color-on-primary)', 2) +
    r(102, 32, 30, 26, S, 13) +
    c(117, 45, 4, I),
  'Text inputs':
    r(24, 22, 112, 22, S, 6) +
    r(32, 31, 40, 4, H, 2) +
    r(74, 28, 2, 10, P, 1) +
    r(24, 52, 112, 22, S, 6) +
    c(36, 63, 3, I) +
    c(46, 63, 3, I) +
    c(56, 63, 3, I) +
    c(66, 63, 3, I),
  'Choice controls':
    r(26, 22, 16, 16, P, 4) +
    p('M30 30l3 3 6-6', 'fill:none;stroke:var(--color-on-primary);stroke-width:2') +
    r(50, 27, 44, 6, H, 3) +
    r(104, 20, 32, 20, P, 10) +
    c(126, 30, 7, 'fill:var(--color-on-primary)') +
    r(26, 60, 110, 4, H, 2) +
    r(26, 60, 62, 4, P, 2) +
    c(88, 62, 8, S),
  Selection:
    r(30, 14, 100, 20, S, 6) +
    p('M114 22l4 4 4-4', LINE) +
    r(30, 38, 100, 42, S, 6) +
    r(34, 43, 92, 10, SOFT, 4) +
    r(40, 46, 40, 4, P, 2) +
    r(40, 59, 52, 4, H, 2) +
    r(40, 70, 34, 4, H, 2),
  'Dates and times':
    r(36, 12, 88, 70, S, 8) +
    r(36, 12, 88, 14, P, 8) +
    r(36, 20, 88, 6, P, 0) +
    [0, 1, 2, 3, 4, 5]
      .map((i) =>
        [0, 1, 2].map((j) => c(50 + i * 12, 38 + j * 13, 3.5, i === 3 && j === 1 ? A : H)).join(''),
      )
      .join('') +
    c(86, 51, 7, SOFT),
  'Status and display':
    c(44, 45, 16, SOFT) +
    c(44, 40, 6, P) +
    p('M33 56a11 9 0 0 1 22 0', P) +
    r(70, 28, 30, 12, P, 6) +
    r(104, 28, 26, 12, SOFT, 6) +
    r(70, 50, 60, 4, I, 2) +
    r(70, 60, 40, 4, H, 2),
  'Layout and surfaces':
    r(22, 14, 54, 62, S, 8) +
    r(84, 14, 54, 28, S, 8) +
    r(84, 48, 54, 28, SOFT, 8) +
    r(30, 22, 30, 4, I, 2) +
    r(30, 32, 38, 4, H, 2),
  'Data and charts':
    r(30, 52, 14, 24, SOFT, 3) +
    r(50, 36, 14, 40, P, 3) +
    r(70, 44, 14, 32, SOFT, 3) +
    r(90, 22, 14, 54, A, 3) +
    r(110, 40, 14, 36, SOFT, 3) +
    r(26, 78, 102, 1.5, H, 0),
  Feedback:
    r(30, 26, 100, 38, S, 8) +
    c(48, 45, 8, P) +
    p('M44 45l3 3 5-6', 'fill:none;stroke:var(--color-on-primary);stroke-width:2') +
    r(64, 38, 50, 4, I, 2) +
    r(64, 48, 36, 4, H, 2) +
    r(30, 60, 70, 4, P, 2),
  Navigation:
    r(20, 18, 120, 18, S, 9) +
    r(24, 21, 34, 12, P, 6) +
    r(66, 25, 24, 4, H, 2) +
    r(98, 25, 24, 4, H, 2) +
    c(40, 60, 3, H) +
    p('M54 60h18', LINE2) +
    c(80, 60, 5, P) +
    p('M88 60h18', LINE2) +
    c(118, 60, 3, H),
  Overlays:
    r(16, 12, 128, 66, 'fill:color-mix(in oklab, var(--color-ink) 12%, transparent)', 8) +
    r(40, 22, 80, 48, S, 8) +
    r(48, 30, 40, 4, I, 2) +
    r(48, 40, 56, 4, H, 2) +
    r(88, 54, 24, 10, P, 5),
  'Disclosure and tables':
    r(28, 14, 104, 18, S, 5) +
    p('M118 21l4 4 4-4', LINE) +
    r(28, 36, 104, 40, S, 5) +
    r(36, 44, 50, 4, I, 2) +
    r(36, 54, 80, 4, H, 2) +
    r(36, 64, 66, 4, H, 2),
  'Desk and editing':
    r(22, 14, 116, 16, S, 5) +
    [0, 1, 2, 3].map((i) => r(28 + i * 14, 18, 8, 8, i === 1 ? P : H, 2)).join('') +
    r(30, 40, 4, 4, P, 1) +
    r(38, 40, 40, 4, I, 2) +
    r(42, 52, 4, 4, H, 1) +
    r(50, 52, 50, 4, H, 2) +
    r(42, 64, 4, 4, A, 1) +
    r(50, 64, 36, 4, H, 2),
  'App shell':
    r(50, 8, 60, 76, S, 10) +
    r(56, 16, 48, 10, SOFT, 4) +
    r(56, 32, 48, 4, H, 2) +
    r(56, 40, 36, 4, H, 2) +
    r(50, 68, 60, 16, P, 0) +
    c(66, 76, 3, 'fill:var(--color-on-primary)') +
    c(80, 76, 3, 'fill:var(--color-on-primary)') +
    c(94, 76, 3, 'fill:var(--color-on-primary)'),
  Motion:
    r(20, 40, 24, 12, SOFT, 6) +
    r(52, 40, 30, 12, 'fill:color-mix(in oklab, var(--color-primary) 45%, transparent)', 6) +
    r(90, 40, 40, 12, P, 6) +
    p('M20 66q30-20 60 0t60 0', LINE2),
  Effects:
    `<defs><radialGradient id="art-glow"><stop offset="0" style="stop-color:var(--color-primary);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--color-primary);stop-opacity:0"/></radialGradient></defs>` +
    r(24, 14, 112, 62, S, 10) +
    c(60, 36, 34, 'fill:url(#art-glow)') +
    r(
      24,
      14,
      112,
      62,
      'fill:none;stroke:var(--color-primary);stroke-width:1.5;stroke-dasharray:30 200',
      10,
    ) +
    r(36, 56, 40, 4, I, 2),
  Chat:
    r(20, 16, 76, 22, S, 11) +
    r(30, 25, 50, 4, H, 2) +
    r(64, 44, 76, 22, P, 11) +
    r(74, 53, 54, 4, 'fill:var(--color-on-primary)', 2) +
    c(32, 76, 2.5, H) +
    c(40, 76, 2.5, H) +
    c(48, 76, 2.5, H),
  Install:
    r(46, 10, 68, 72, S, 12) +
    r(66, 26, 28, 28, P, 8) +
    p(
      'M80 32v14m-6-5l6 6 6-6',
      'fill:none;stroke:var(--color-on-primary);stroke-width:2.5;stroke-linecap:round',
    ) +
    r(60, 62, 40, 4, H, 2),
  More: c(56, 45, 6, H) + c(80, 45, 6, P) + c(104, 45, 6, H),
  // Flagships
  BaseButton:
    r(24, 30, 72, 30, P, 15) +
    r(38, 43, 44, 4, 'fill:var(--color-on-primary)', 2) +
    r(104, 30, 34, 30, S, 15) +
    p(
      'M114 45h14m-5-5l5 5-5 5',
      'fill:none;stroke:var(--color-ink);stroke-width:2;stroke-linecap:round',
    ),
  BaseModal:
    r(10, 6, 140, 78, 'fill:color-mix(in oklab, var(--color-ink) 14%, transparent)', 8) +
    r(36, 16, 88, 58, S, 10) +
    r(44, 26, 46, 5, I, 2) +
    c(114, 28, 4, H) +
    r(44, 37, 70, 4, H, 2) +
    r(44, 45, 58, 4, H, 2) +
    r(70, 58, 22, 10, S, 5) +
    r(96, 58, 22, 10, P, 5),
  DataTable:
    r(18, 12, 124, 68, S, 6) +
    r(18, 12, 124, 14, SOFT, 6) +
    [0, 1, 2, 3]
      .map(
        (i) =>
          r(26, 34 + i * 11, 30, 4, i === 1 ? P : H, 2) +
          r(64, 34 + i * 11, 40, 4, H, 2) +
          r(112, 34 + i * 11, 20, 4, I, 2),
      )
      .join('') +
    r(26, 17, 24, 4, I, 2) +
    r(64, 17, 24, 4, I, 2),
  LineChart:
    p('M20 70L48 50 72 58 98 30 122 38 140 18V78H20Z', SOFT) +
    p('M20 70L48 50 72 58 98 30 122 38 140 18', LINE) +
    c(98, 30, 4, A) +
    r(20, 78, 120, 1.5, H, 0),
  BentoGrid:
    r(18, 10, 70, 44, P, 8) +
    r(94, 10, 48, 20, S, 8) +
    r(94, 34, 48, 46, SOFT, 8) +
    r(18, 60, 32, 20, S, 8) +
    r(56, 60, 32, 20, S, 8),
  Dock:
    r(24, 54, 112, 26, S, 13) +
    r(34, 60, 14, 14, H, 4) +
    r(52, 60, 14, 14, SOFT, 4) +
    r(70, 38, 22, 22, P, 7) +
    r(96, 60, 14, 14, SOFT, 4) +
    r(114, 60, 14, 14, H, 4) +
    c(81, 70, 2, P),
  ChatThread:
    r(18, 10, 62, 18, S, 9) +
    r(80, 34, 62, 18, P, 9) +
    r(18, 58, 80, 18, S, 9) +
    r(28, 66, 40, 3, H, 2) +
    c(110, 67, 2.5, P) +
    c(118, 67, 2.5, P) +
    c(126, 67, 2.5, P),
  PricingCard:
    r(44, 6, 72, 80, S, 10) +
    r(52, 14, 26, 8, SOFT, 4) +
    r(52, 30, 36, 9, I, 2) +
    p('M54 48l3 3 5-5M54 58l3 3 5-5', 'fill:none;stroke:var(--color-primary);stroke-width:2') +
    r(66, 48, 36, 4, H, 2) +
    r(66, 58, 30, 4, H, 2) +
    r(52, 70, 56, 10, P, 5),
}

export const ART_SPRITE = Object.entries(ART)
  .map(([k, body]) => `<symbol id="${artId(k)}" viewBox="0 0 160 90">${body}</symbol>`)
  .join('')

export function artId(key: string) {
  return `art-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

/** The symbol a card draws: its own if it is a flagship, else its category's. */
export function artFor(name: string, category: string) {
  return artId(name in ART ? name : category in ART ? category : 'More')
}

export const NEW = new Set([
  'HeroBackdrop',
  'SpotlightCard',
  'BentoGrid',
  'BentoCell',
  'BorderBeam',
  'AnimatedBeam',
  'TiltCard',
  'Dock',
  'Sparkline',
  'LineChart',
  'ChatMessage',
  'ChatThread',
  'PromptInput',
  'PricingCard',
])
