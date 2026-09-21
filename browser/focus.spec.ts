import { expect, test } from '@playwright/test'

/**
 * Whether a focus ring is actually drawn.
 *
 * `focus.spec.ts` in jsdom reads every component for a `focus-ring` class or
 * a `:focus-visible` rule of its own. That is the half that can be read off
 * the source, and it is worth having — a missing ring compiles and renders.
 * What it cannot tell you is whether the rule that is there paints anything:
 * an outline of zero width, a ring the same colour as what it sits on, a
 * ring clipped away by an `overflow: hidden` two elements up. All three need
 * a browser, and all three look exactly like a working focus ring in the
 * source.
 *
 * Every material redefines depth and edges, so the check is run in each of
 * them: a ring that survives `quiet` and vanishes under `brutal` is the
 * shape this is for.
 */
const MATERIALS = ['quiet', 'glass', 'brutal', 'soft'] as const

/* A control from each family that draws its own ring, rather than every
   control on the page: this is a check on the mechanism, and the mechanism
   is shared. */
const CONTROLS = [
  // A button, a text field, a switch, a tab, and a control whose real input
  // is `sr-only` and hands its ring to the span beside it through `peer`.
  'button.focus-visible\\:outline-primary',
  'input.control',
  '.rk-switch',
  '.rk-tab',
  'input.peer.sr-only',
]

test.describe('a focus ring is painted, not only declared', () => {
  for (const material of MATERIALS) {
    test(material, async ({ page }) => {
      await page.goto('/')
      await page.evaluate((value) => {
        document.documentElement.dataset['material'] = value
      }, material)

      const unpainted: string[] = []

      for (const selector of CONTROLS) {
        const control = page.locator(selector).first()
        if ((await control.count()) === 0) {
          unpainted.push(`${selector} — nothing on the page matches it`)
          continue
        }

        await control.focus()

        /* The ring may be on the element or on the one it hands focus to:
           an `sr-only` input paints its ring on the visible span through
           `peer-focus-visible:`, which is the pattern the kit uses wherever
           the real control cannot be seen. So the next sibling counts. */
        const drawn = await control.evaluate((element) => {
          const painted = (node: Element) => {
            const style = getComputedStyle(node)
            return (
              Number.parseFloat(style.outlineWidth) > 0 ||
              (style.boxShadow !== 'none' && style.boxShadow !== '')
            )
          }

          return painted(element) || (element.nextElementSibling !== null && painted(element.nextElementSibling))
        })

        if (!drawn) unpainted.push(`${selector} — no outline and no ring`)
      }

      expect(unpainted).toEqual([])
    })
  }
})
