import { expect, test } from '@playwright/test'

/**
 * The check that used to be a person opening three apps and comparing.
 *
 * A lost focus ring, a heading that stopped growing, a chip whose padding
 * collapsed — none of it fails a type-check, a behaviour test, an axe audit
 * or a size budget, so the release notes for this kit have said "look at
 * the three apps before and after" since it had three apps. That is slow,
 * it is done under time pressure, and it is done by the person least likely
 * to notice a five-pixel change because they have been staring at it.
 *
 * The showcase renders every component in every material and palette, so it
 * is a superset of what those three apps put on screen. A handful of its
 * cards, compared against a stored picture, catches the same class of
 * regression without anybody opening anything.
 *
 * ## Deliberately small, and deliberately not in CI
 *
 * A baseline per component would be a hundred pictures to regenerate every
 * time a padding changes on purpose, and a wall of noise is ignored like
 * any other wall. These are the shapes that carry the most layout: a row of
 * buttons, a field with its label and error, a chip, a stack, a table.
 *
 * Not in CI because font rendering differs between this machine and a Linux
 * runner, so the baselines would fail on arrival for a reason that has
 * nothing to do with the change. Run it before a release:
 *
 *   pnpm test:browser                    # compare
 *   pnpm test:browser -u                 # accept the new look
 */
const SHOTS = [
  { id: 'action', what: 'a row of buttons' },
  { id: 'form-input', what: 'a field with its label and hint' },
  { id: 'form-password', what: 'a field with a control inside it' },
  { id: 'basics-chip', what: 'chips, which carry the tinted tones' },
  { id: 'basics-avatars', what: 'a stack, which overlaps by margin' },
]

/* Two materials, because a material redefines depth, edges and press — the
   two furthest apart catch what one alone would not. */
const MATERIALS = ['quiet', 'brutal'] as const

for (const material of MATERIALS) {
  for (const shot of SHOTS) {
    test(`${material}: ${shot.what}`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate((value) => {
        document.documentElement.dataset['material'] = value
      }, material)

      const target = page.locator(`#${shot.id}`)
      await expect(target).toBeVisible()

      await expect(target).toHaveScreenshot(`${shot.id}-${material}.png`, {
        animations: 'disabled',
        /* A hair of tolerance: sub-pixel text rendering moves by a shade
           between runs on the same machine, and a check that cries wolf is
           a check nobody runs twice. */
        maxDiffPixelRatio: 0.01,
      })
    })
  }
}
