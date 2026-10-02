import { expect, test } from '@playwright/test'

/**
 * The page's own controls read the arrow keys the way the kit's do.
 *
 * `ArrowRight` means "next" only where the writing runs left to right. The
 * kit fixed this in ten of its own controls in 2.23.0 and `AGENTS.md` asks
 * anything written beside them to read the key through `horizontalStep` —
 * and then this site's palette picker, a file that imports the kit, did not.
 * Under the direction toggle at the top of the same page, its arrows walked
 * backwards through the row.
 *
 * Nothing else catches it: the code type-checks, the styles are already
 * logical, and the keys are the same keys. It takes a browser with `dir` set
 * and a press.
 */
test('the palette picker mirrors its arrows under RTL', async ({ page }) => {
  await page.goto('/')

  const palette = () => page.evaluate(() => document.documentElement.dataset['palette'] ?? 'rei')
  const pressRight = async () => {
    await page.locator('.pp-trigger').click()
    const before = await palette()
    await page.keyboard.press('ArrowRight')
    const after = await palette()
    await page.keyboard.press('Escape')
    return { before, after }
  }

  const ltr = await pressRight()
  expect(ltr.after).not.toBe(ltr.before)

  await page.getByRole('button', { name: 'Right to left' }).click()
  expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl')

  const rtl = await pressRight()
  /* Right is the other way now, so the same press lands back where it
     started rather than carrying on in list order. */
  expect(rtl.after).toBe(ltr.before)
})
