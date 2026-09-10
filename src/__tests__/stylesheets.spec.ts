import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import pkg from '../../package.json' with { type: 'json' }

/**
 * What each stylesheet is allowed to contain.
 *
 * `tokens.css` shipped the phone shell to every consumer, including a wide
 * course site that used none of it: a 430px column, a full-viewport height and
 * an iOS sheet curve, downloaded so they could be ignored. Nothing caught it
 * because a stylesheet has no types and an unused class breaks nothing — it
 * just made the kit look like a phone-app kit and left a wide app with no
 * counterpart.
 *
 * These read the source, not the build, so they fail in a watch run rather
 * than after `pnpm build`.
 */
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')

const tokens = read('../styles/tokens.css')
const mobile = read('../styles/shell/mobile.css')
const web = read('../styles/shell/web.css')

/** Classes that describe a phone, and belong only to the phone shell. */
const PHONE = ['.shell-frame', '.page-slide', '.page-auth', '.slide-forward', '.slide-backward']

describe('tokens.css', () => {
  it('carries the roles every app needs', () => {
    for (const role of [
      '--color-primary',
      '--color-accent',
      '--color-positive',
      '--color-negative',
      '--color-warning',
      '--color-canvas',
      '--color-surface',
      '--color-muted',
      '--color-ink',
      '--color-ink-soft',
      '--color-hair',
      '--measure-page',
      '--measure-reading',
    ]) {
      expect(tokens, `${role} is missing from tokens.css`).toContain(role)
    }
  })

  it('carries the dark variant, since nothing else can declare it', () => {
    expect(tokens).toContain('@custom-variant dark')
    expect(tokens).toContain('.dark {')
  })

  it('keeps the utilities that are not about a shape', () => {
    // A scrollbar you do not want and room for a home indicator are wanted by
    // a wide site as much as by a phone.
    expect(tokens).toContain('@utility no-scrollbar')
    expect(tokens).toContain('@utility pb-safe')
  })

  it('describes no shape at all', () => {
    for (const shape of PHONE) {
      expect(tokens, `${shape} belongs in a shell, not in tokens.css`).not.toContain(shape)
    }

    // A wide app imports the tokens too, and a page transition is a shape.
    expect(tokens).not.toContain('.page-enter')
  })
})

describe('the shells', () => {
  it('mobile holds the phone, and only the phone', () => {
    for (const shape of PHONE) expect(mobile).toContain(shape)

    // The guide's slide transition lives here rather than in TourShell's
    // scoped block, because a scoped rule cannot reach slot content and the
    // slides belong to the app.
    expect(mobile).toContain('.tour-forward-enter-active')

    // The values a shell must not invent: they come from tokens.css.
    expect(mobile).not.toMatch(/--color-[a-z-]+:/)
  })

  it('web holds the wide page, and only that', () => {
    expect(web).toContain('.shell')
    expect(web).toContain('.page-enter-active')
    expect(web).not.toContain('.shell-frame')
    expect(web).not.toMatch(/--color-[a-z-]+:/)
  })

  it('both answer reduced motion, because both move', () => {
    for (const [name, sheet] of [
      ['mobile', mobile],
      ['web', web],
    ] as const) {
      expect(sheet, `${name} animates without honouring the preference`).toContain(
        'prefers-reduced-motion',
      )
    }
  })
})

describe('the exports map', () => {
  it('offers every stylesheet the kit ships', () => {
    // A file in src/styles that nothing can import is a file that does not
    // exist as far as a consumer is concerned.
    for (const entry of ['./tokens.css', './shell/mobile.css', './shell/web.css', './styles.css']) {
      expect(pkg.exports, `${entry} is not in the exports map`).toHaveProperty(entry)
    }
  })
})
