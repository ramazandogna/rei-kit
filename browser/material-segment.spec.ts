import { expect, test } from '@playwright/test'

/**
 * Every surface in the kit changes with the material, including the ones
 * painted by hand inside it.
 *
 * `bg-surface` sets a colour. The `surface` and `control` utilities set the
 * colour, the border width, the depth and the backdrop — and those four are
 * what a material redefines. So an element wearing the parts looks right in
 * `quiet` and ignores the other three, which is invisible from the source
 * because both spellings render and both follow the palette.
 *
 * `SegmentedControl`'s selected segment was wearing the parts: it never grew
 * `brutal`'s hard edge while every control beside it did, on a page whose
 * whole claim is that one attribute changes what a surface is made of.
 * `appearance.spec.ts` now reads the source for the spelling; this reads the
 * paint, which is the half a source test cannot reach.
 */
test('the selected segment wears the material like every other control', async ({ page }) => {
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

    return {
      segment: await depth('#form-segmented label:has(input:checked) span'),
      control: await depth('#form-input input.control'),
    }
  }

  const quiet = await wear('quiet')
  const brutal = await wear('brutal')

  /* The control is the yardstick: whatever brutal does to it, the segment
     has to do as well. Before this it stayed 0px in both. */
  expect(brutal.control).not.toBe(quiet.control)
  expect(brutal.segment).toBe(brutal.control)
  expect(quiet.segment).toBe(quiet.control)
})
