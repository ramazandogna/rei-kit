import { expect, test } from '@playwright/test'

/**
 * Everything on this page follows the material, including the hand-written
 * parts of it.
 *
 * The site's headline claim is that one attribute changes what every surface
 * is made of. A control painted with `border border-hair bg-surface` instead
 * of the `control` utility looks right in the quiet material and ignores
 * every other one, and the demo inside `FormField` was doing exactly that:
 * under `brutal` the kit's own fields grew a 2px edge and a hard shadow
 * while it stayed 1px and flat, on the page making the claim.
 *
 * Checked by comparing a hand-written control against one of the kit's own
 * in two materials rather than by reading the source for class names, which
 * would pass on any spelling that happened to look right.
 */
test('a control written by hand changes with the material too', async ({ page }) => {
  await page.goto('/')

  const depth = async (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el)
        return `${style.borderTopWidth}|${style.boxShadow === 'none' ? 'flat' : 'raised'}`
      })

  const wear = async (material: string) => {
    await page.evaluate((m) => {
      document.documentElement.dataset['material'] = m
    }, material)
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)))

    return { own: await depth('#form-field input'), kit: await depth('#form-input input.control') }
  }

  const quiet = await wear('quiet')
  const brutal = await wear('brutal')

  /* The kit's control is the yardstick: whatever brutal does to it, the
     hand-written one has to do as well. */
  expect(brutal.kit).not.toBe(quiet.kit)
  expect(brutal.own).toBe(brutal.kit)
  expect(quiet.own).toBe(quiet.kit)
})
