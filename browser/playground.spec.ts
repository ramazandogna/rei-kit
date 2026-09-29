import { expect, test } from '@playwright/test'

/**
 * That the playground actually drives a component.
 *
 * Every control on it is derived from `props.generated.json` rather than
 * written out, which is what keeps it from going stale — and also what makes
 * it able to fail silently. A prop whose type stops parsing loses its control
 * and the panel still renders; a component resolved from the wrong entry
 * point renders nothing at all, inside a `<details>` most readers never open.
 * Both look like a page that is working.
 *
 * So this presses the buttons: change a prop, and both the rendered component
 * and the snippet beside it have to follow. jsdom could mount the panel but
 * not tell whether the class the change produced is on the element a reader
 * sees.
 */
test.describe('the prop playground', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.goto('/')
    /* A component that fails to resolve throws while rendering, and the
       panel around it still looks fine. */
    expect(errors).toEqual([])
  })

  test('offers a panel on the components it can drive', async ({ page }) => {
    const panels = page.locator('summary', { hasText: 'you can change' })

    /* Derived from the catalogue, so the exact number moves with the kit.
       What matters is that the derivation produced a useful set rather than
       one or none, which is how a broken type parser would present. */
    expect(await panels.count()).toBeGreaterThan(20)
  })

  test('changing a prop changes the component and the snippet', async ({ page }) => {
    const article = page.locator('#api-BaseButton')
    await article.locator('summary', { hasText: 'you can change' }).click()

    const rendered = article.locator('.canvas button').first()
    await expect(rendered).toBeVisible()

    const before = await rendered.getAttribute('class')
    await article.getByRole('button', { name: 'ghost', exact: true }).click()

    await expect(rendered).not.toHaveClass(before ?? '')
    await expect(article.locator('pre').last()).toContainText('variant="ghost"')
  })

  test('a prop left at its default stays out of the snippet', async ({ page }) => {
    const article = page.locator('#api-BaseButton')
    await article.locator('summary', { hasText: 'you can change' }).click()

    const snippet = article.locator('pre').last()

    /* The point of the snippet is that it is what you would write, not a
       dump of every prop the component has. */
    await expect(snippet).not.toContainText('variant=')
    await expect(snippet).toContainText('<BaseButton')

    await article.getByRole('button', { name: 'lg', exact: true }).click()
    await expect(snippet).toContainText('size="lg"')
  })

  test('reset puts every control back', async ({ page }) => {
    const article = page.locator('#api-BaseButton')
    await article.locator('summary', { hasText: 'you can change' }).click()

    await article.getByRole('button', { name: 'ghost', exact: true }).click()
    await expect(article.locator('pre').last()).toContainText('variant="ghost"')

    await article.getByRole('button', { name: 'Reset to defaults' }).click()
    await expect(article.locator('pre').last()).not.toContainText('variant=')
  })
})
