import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Contrast, measured against what a browser actually painted.
 *
 * `appearance.spec.ts` already checks every palette's pairings by
 * arithmetic — the token values, in both modes. What that cannot see is
 * everything between a token and a pixel: text over a glass surface with a
 * backdrop filter behind it, a disabled control at reduced opacity, a hint
 * in `ink-soft` on a `muted` fill, a badge whose ground is a tint of a role
 * rather than the role. Each of those is a real colour on a real
 * background and none of them is a pairing anyone wrote down.
 *
 * So: the whole showcase page, which renders every component, with
 * `color-contrast` and nothing else. One rule rather than a full audit,
 * because the structural rules already run on every example in jsdom and
 * running them again here would be slower and say the same thing.
 *
 * The combinations are chosen rather than exhaustive — four materials times
 * ten palettes times two modes is eighty page loads for a check that has to
 * run on every push. Every material is covered at the default palette and
 * every palette at the default material, in both modes, which reaches each
 * axis without multiplying them.
 */
const MATERIALS = ['quiet', 'glass', 'brutal', 'soft'] as const

const PALETTES = [
  'rei',
  'nord',
  'dracula',
  'catppuccin',
  'solarized',
  'gruvbox',
  'tokyo-night',
  'rose-pine',
  'sakura',
  'matcha',
] as const

async function dress(page: Page, material: string, palette: string, dark: boolean) {
  await page.evaluate(
    ([material, palette, dark]) => {
      const root = document.documentElement
      root.dataset['material'] = material as string
      root.dataset['palette'] = palette as string
      root.classList.toggle('dark', Boolean(dark))
    },
    [material, palette, dark] as const,
  )

  /* The materials change a backdrop filter and the palettes a dozen custom
     properties; both are painted on the next frame, and axe reads the frame
     it is given. */
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)))

  /* Animations are stopped first, and that is the whole reason this check
     became trustworthy. An element that pulses has a contrast ratio per
     frame, so axe sampling "the frame it is given" turned a real fault into
     a result that came back red about once in thirty runs — which reads as
     a flaky test and gets re-run rather than read. The fault itself did not
     go away by being sampled less often: `animate-pulse-soft` sat below AA
     in three palettes for as long as it existed.
     
     So the two questions are asked separately. This one reads the page at
     rest. `motion-pack.spec.ts` takes the opacity out of every repeating
     keyframe and checks it against all twenty palette-and-mode pairs
     exactly, with nothing sampled at all. */
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important }',
  })
}

async function contrast(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    /* The showcase's own syntax highlighter, which is not part of the
       package: a hundred-line parser in `showcase/highlight.ts` colouring
       code samples. Its colours fail too — 1,036 of the 1,153 nodes on the
       first run — and that is a fault on this site rather than in the kit,
       filed as its own thing so it cannot hide what the kit is doing. */
    .exclude('.cb')
    .analyze()

  return violations.flatMap((violation) =>
    violation.nodes.map((node) => `${node.target.join(' ')} — ${node.failureSummary ?? ''}`),
  )
}

test.describe('contrast, as painted', () => {
  for (const material of MATERIALS) {
    for (const dark of [false, true]) {
      test(`${material}, ${dark ? 'dark' : 'light'}`, async ({ page }) => {
        await page.goto('/')
        await dress(page, material, 'rei', dark)

        expect(await contrast(page)).toEqual([])
      })
    }
  }

  for (const palette of PALETTES) {
    for (const dark of [false, true]) {
      test(`${palette}, ${dark ? 'dark' : 'light'}`, async ({ page }) => {
        await page.goto('/')
        await dress(page, 'quiet', palette, dark)

        expect(await contrast(page)).toEqual([])
      })
    }
  }
})
