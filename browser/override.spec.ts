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
