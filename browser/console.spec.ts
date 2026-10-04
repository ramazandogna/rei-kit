import { expect, test } from '@playwright/test'

/**
 * The documentation site, loaded without complaining.
 *
 * Everything else here asks whether something looks right. This asks whether
 * the page thinks it worked — and it found four things no other check could
 * see, because Vue catches a render error, logs it, and leaves a comment node
 * where the component should be:
 *
 * - `BaseHoverCard` was used in `OverlaysSection.vue` and never imported, so
 *   that demo had not been on the page at all. The template compiled, the
 *   type-check passed, the prop table beneath it was correct, and the
 *   component simply was not there.
 * - The playground seeded every optional string prop with `''`, which is a
 *   date key `BaseCalendar` cannot parse and a locale tag `Intl` throws on.
 * - And `NumberInput`'s `-Infinity`/`Infinity` bounds reached an
 *   `<input type="number">`, seven times per load.
 *
 * A console error on a kit's own showcase is the first thing an evaluating
 * developer sees, and the last thing anybody notices while building it.
 */
test('the showcase loads with nothing in the console', async ({ page }) => {
  const problems: string[] = []

  page.on('pageerror', (error) => problems.push(`uncaught: ${String(error)}`))
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`${message.type()}: ${message.text()}`)
    }
  })

  await page.goto('/')
  /* The gallery mounts in one burst; a component that throws does so while
     mounting, not on navigation. */
  await page.waitForTimeout(1500)

  expect(problems).toEqual([])
})

test('every section the nav offers is really on the page', async ({ page }) => {
  await page.goto('/')

  /* The other half of the same fault: a link whose target never rendered
     scrolls nowhere and says nothing. */
  const targets = await page.locator('nav a[href^="#"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')!.slice(1)).filter(Boolean),
  )

  expect(targets.length).toBeGreaterThan(20)

  const missing: string[] = []
  for (const id of targets) {
    if ((await page.locator(`[id="${id}"]`).count()) === 0) missing.push(id)
  }

  expect(missing).toEqual([])
})
