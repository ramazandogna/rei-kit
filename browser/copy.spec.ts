import { expect, test } from '@playwright/test'

/**
 * The copy buttons on this site say that they copied.
 *
 * All three were written by hand — a pill in a code block's bar, another in
 * the install card, the install command itself in the hero — and all three
 * lost the live region on the way, so the tick appeared and a reader who
 * could not see it was told nothing. That is what `CopyButton` exists to
 * carry and what `variant="unstyled"` now lets a different shape keep.
 *
 * Checked here rather than in jsdom because what is being asserted is that
 * the region is in the page the reader gets, not that a component renders
 * one when mounted alone.
 */
test('every copy button on the page owns a live region', async ({ page }) => {
  await page.goto('/')

  const buttons = page.locator('button:has-text("Copy"), button[aria-label*="opy"]')
  const count = await buttons.count()

  /* If the selector ever stops matching, this would pass by checking
     nothing. */
  expect(count).toBeGreaterThan(2)

  const silent: string[] = []
  for (let i = 0; i < count; i += 1) {
    const button = buttons.nth(i)
    if ((await button.locator('[role="status"][aria-live]').count()) === 0) {
      silent.push((await button.getAttribute('class')) ?? `button ${i}`)
    }
  }

  expect(silent).toEqual([])
})
