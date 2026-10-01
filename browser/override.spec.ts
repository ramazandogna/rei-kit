import { expect, test } from '@playwright/test'

/**
 * That setting a token on one element still overrides that element.
 *
 * This is the kit's whole answer to "I want this one card square", and it is
 * a promise about a mechanism rather than about any component: a custom
 * property is inherited, so it cannot be out-sorted the way a utility class
 * can. The showcase section is the documentation and this is the check that
 * the documentation is still true.
 *
 * It has to run in a browser twice over. The values are only resolved by one
 * — `var(--radius-card)` is a string until something computes it — and the
 * classes only exist at all because the section uses them: Tailwind generates
 * what it finds in the source, so a check that injected these class names at
 * runtime would measure elements with no rules attached and call the result
 * a pass. That mistake was made once already while this was being written.
 */
test.describe('a token set on one element', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('changes that element and leaves its neighbours alone', async ({ page }) => {
    const section = page.locator('#override')
    const cards = section.locator('.override-demo')

    const radius = (n: number) =>
      cards.nth(n).evaluate((el) => getComputedStyle(el).borderTopLeftRadius)

    /* The default is the card radius; the middle card sets the token to zero
       and the third does not touch radius at all. If scoping ever stopped
       working, all three would read the same. */
    expect(await radius(0)).toBe('16px')
    expect(await radius(1)).toBe('0px')
    expect(await radius(2)).toBe('16px')
  })

  test('rescales the spacing inside it, and only inside it', async ({ page }) => {
    const cards = page.locator('#override .override-demo')

    const padding = (n: number) => cards.nth(n).evaluate((el) => getComputedStyle(el).paddingTop)

    const base = await padding(0)
    expect(await padding(1)).toBe(base)
    expect(await padding(2)).not.toBe(base)
  })

  test('is what a class cannot do', async ({ page }) => {
    /* The reason the section exists, asserted rather than claimed, on the
       card that is on the page demonstrating it. Both utilities have rules
       here; the kit's wins because Tailwind ordered it later. If that ever
       reversed, the advice on the page would be wrong and this would say
       so before a reader found out. */
    const attempted = page.locator('#override .override-demo').nth(3)

    await expect(attempted).toHaveCSS('border-top-left-radius', '16px')
  })
})

/**
 * The two things about an attached addon that jsdom cannot answer.
 *
 * `form-pack.spec.ts` checks that the surface moves to the wrapper and the
 * label stays wired, which is readable from the markup. Whether the border
 * actually encloses the addon, and whether the ring the group declares is
 * really painted when the input inside it has keyboard focus, are both
 * questions about layout and paint.
 */
test.describe('an input with something attached', () => {
  test('the border encloses the addon rather than ending before it', async ({ page }) => {
    await page.goto('/')
    const group = page.locator('#form-input div.control')
    const addon = group.locator('span[aria-hidden="true"]')

    const [box, mark] = await Promise.all([group.boundingBox(), addon.boundingBox()])

    expect(box).not.toBeNull()
    expect(mark).not.toBeNull()
    /* Inside the group's box on both sides. The failure this guards is an
       addon sitting outside a border that stopped at the input's edge,
       which is what happens if the surface is left on the input. */
    expect(mark!.x).toBeGreaterThan(box!.x)
    expect(mark!.x + mark!.width).toBeLessThanOrEqual(box!.x + box!.width)
  })

  test('the ring is painted on the group when the input is focused', async ({ page }) => {
    await page.goto('/')
    const group = page.locator('#form-input div.control')

    const outline = () => group.evaluate((el) => getComputedStyle(el).outlineStyle)

    /* `outline-style`, not `outline-width`: a browser computes a width even
       for an outline it is not drawing, so the width alone reads as a ring
       on an element that has none. */
    expect(await outline()).toBe('none')

    await group.locator('input').focus()

    expect(await outline()).toBe('solid')
  })
})
