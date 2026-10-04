import { expect, test, type Locator } from '@playwright/test'

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
/* The panel's own snippet, not the last `<pre>` in the card: the usage sample
   moved below the playground, into a fold, and `.last()` then pointed at the
   sample — which does write every prop out and would have passed or failed
   for the wrong reason. */
const snippetOf = (article: Locator) =>
  article.locator('details:has(summary:text-matches("you can change")) pre').last()

test.describe('the prop playground', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.goto('/')
    /* A component that fails to resolve throws while rendering, and the
       panel around it still looks fine. */
    expect(errors).toEqual([])
  })

  test('offers a panel on the components it can drive, already open', async ({ page }) => {
    const panels = page.locator('summary', { hasText: 'you can change' })

    /* Derived from the catalogue, so the exact number moves with the kit.
       The floor is `playground-data.spec.ts`'s; what this adds is that they
       are on the page rather than only in the derivation. */
    expect(await panels.count()).toBeGreaterThan(60)

    /* Open, not folded away. It was a closed `<details>` until the person
       paying for the page said he could not change a button's props and
       watch — which was true: the panel was there, under a summary, below a
       code sample, and he never saw it. A control nobody finds is a control
       that does not exist. */
    const first = page.locator('details:has(summary:text-matches("you can change"))').first()
    await expect(first).toHaveAttribute('open', '')
  })

  /* The half that had no playground at all: a component whose required prop
     is a list. The seeds in `playground-data.ts` render it, and the props
     beside the list still have to drive it. */
  test('drives a component whose data comes from a seed', async ({ page }) => {
    const article = page.locator('#api-BaseSelect')

    await expect(article.locator('.canvas select')).toBeVisible()
    await expect(article.locator('.canvas option').first()).toHaveText('Türkiye')
  })

  test('renders a seeded table rather than an empty box', async ({ page }) => {
    const rows = page.locator('#api-BaseTable .canvas tbody tr')

    await expect(rows).toHaveCount(2)
  })

  test('changing a prop changes the component and the snippet', async ({ page }) => {
    const article = page.locator('#api-BaseButton')

    const rendered = article.locator('.canvas button').first()
    await expect(rendered).toBeVisible()

    const before = await rendered.getAttribute('class')
    await article.getByRole('button', { name: 'ghost', exact: true }).click()

    await expect(rendered).not.toHaveClass(before ?? '')
    await expect(snippetOf(article)).toContainText('variant="ghost"')
  })

  test('a prop left at its default stays out of the snippet', async ({ page }) => {
    const article = page.locator('#api-BaseButton')

    const snippet = snippetOf(article)

    /* The point of the snippet is that it is what you would write, not a
       dump of every prop the component has. */
    await expect(snippet).not.toContainText('variant=')
    await expect(snippet).toContainText('<BaseButton')

    await article.getByRole('button', { name: 'lg', exact: true }).click()
    await expect(snippet).toContainText('size="lg"')
  })

  test('reset puts every control back', async ({ page }) => {
    const article = page.locator('#api-BaseButton')

    await article.getByRole('button', { name: 'ghost', exact: true }).click()
    await expect(snippetOf(article)).toContainText('variant="ghost"')

    await article.getByRole('button', { name: 'Reset to defaults' }).click()
    await expect(snippetOf(article)).not.toContainText('variant=')
  })
})
