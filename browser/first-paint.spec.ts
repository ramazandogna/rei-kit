import { expect, test } from '@playwright/test'

/**
 * What is on screen before the bundle arrives.
 *
 * The page is a client-rendered app whose shell carries real text for
 * crawlers. That text has no classes — the stylesheet is utilities and
 * component classes — so for the second and a half between the first paint
 * and the moment Vue mounts, a visitor on a slow connection read raw black
 * text on white. Measured at the time: first paint 744ms, mounted 2257ms.
 *
 * So the shell has its own inline rules, and these are what keep them: a
 * stylesheet that stops covering the fallback, or markup that stops matching
 * it, both look fine to every other check here.
 */
test.describe('before the app mounts', () => {
  test.use({ javaScriptEnabled: false })

  test('the first paint is a page, not raw text', async ({ page }) => {
    await page.goto('/')

    const body = page.locator('body')
    /* Not white: the canvas colour, painted by the inline rules. */
    await expect(body).toHaveCSS('background-color', 'rgb(244, 250, 248)')

    const title = page.locator('.boot h1')
    await expect(title).toBeVisible()

    /* A heading at browser-default size is the tell that nothing styled it. */
    const size = await title.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
    expect(size).toBeGreaterThan(30)

    /* The component index is the part a search engine comes for. It stays
       readable text rather than being hidden, and it is quiet. */
    const index = page.locator('.boot-index li')
    expect(await index.count()).toBeGreaterThan(100)
  })

  test('the shell is the width of a page, not of the window', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    const width = await page.locator('.boot').evaluate((el) => el.getBoundingClientRect().width)
    expect(width).toBeLessThan(900)
  })
})

test('a returning visitor keeps their theme through the first paint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rei-theme', 'dark')
    localStorage.setItem('rei-palette', 'nord')
  })

  /* The bundle never arrives, so nothing but the shell can have done this.
     Written with `waitUntil: 'commit'` first, which proved nothing: the
     assertion retries for seconds, Vue mounts inside that window and
     `useTheme` sets the class itself. The test passed with the bootstrap
     deleted. */
  await page.route('**/assets/*.js', (route) => route.abort())
  await page.goto('/')

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'nord')
})
