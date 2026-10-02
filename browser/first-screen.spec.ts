import { expect, test } from '@playwright/test'

/**
 * The screen the guide ends on actually works.
 *
 * It is the kit's own claim about forms, standing on the page somebody reads
 * in their first ten minutes: submit it empty and the summary takes focus,
 * its links land on the fields, and each field says what is wrong beside
 * itself. Every one of those is about focus or about what a reader would
 * hear, and jsdom can assert the markup while telling you nothing about
 * whether the focus moved.
 *
 * The point it guards is narrow and worth stating. `ErrorSummary` is
 * *focused*, not announced — `role="alert"` would read a list at somebody
 * whose focus is still on a button they cannot use — so "did the press do
 * anything" is answered by where the focus went, and only by that.
 */
test.describe('the guide screen', () => {
  test('a rejected submission moves focus to the summary', async ({ page }) => {
    await page.goto('/')

    const screen = page.locator('.gs-screen-live')
    await screen.getByRole('button', { name: 'Create account' }).click()

    /* Asserted on the focused element rather than on a class of the
       summary's own, because what is being claimed is where the focus went
       and not how the summary is built. */
    const focused = await page.evaluate(() => ({
      text: document.activeElement?.textContent ?? '',
      tabIndex: document.activeElement?.getAttribute('tabindex'),
    }))

    expect(focused.text).toContain('There are fields to fix')
    /* Focusable by script, never by Tab — a summary in the tab order would
       be a stop that does nothing on every form that is not rejected. */
    expect(focused.tabIndex).toBe('-1')
  })

  test('the summary links land on the fields they name', async ({ page }) => {
    await page.goto('/')

    const screen = page.locator('.gs-screen-live')
    await screen.getByRole('button', { name: 'Create account' }).click()

    /* The failure this guards is the one the kit documents: a summary and a
       field built from different id functions, so every link points at
       nothing and the summary is decoration. */
    const href = await screen.getByRole('link', { name: /^Email:/ }).getAttribute('href')
    expect(href).toBe('#signup-email')

    await screen.getByRole('link', { name: /^Email:/ }).click()
    const id = await page.evaluate(() => document.activeElement?.id ?? '')
    expect(id).toBe('signup-email')
  })

  test('each field carries its own message as well', async ({ page }) => {
    await page.goto('/')

    const screen = page.locator('.gs-screen-live')
    await screen.getByRole('button', { name: 'Create account' }).click()

    /* Both halves, which is what `AGENTS.md` asks for: the summary answers
       "did that work", the message beside the field stays where the eye is. */
    const field = screen.locator('#signup-email')
    await expect(field).toHaveAttribute('aria-invalid', 'true')

    const describedBy = await field.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(screen.locator(`#${describedBy}`)).toContainText('valid email')
  })
})
