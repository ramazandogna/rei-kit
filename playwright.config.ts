import { defineConfig, devices } from '@playwright/test'

/**
 * The half of this kit's accessibility that jsdom cannot see.
 *
 * Everything in `src/__tests__` runs without layout, so two things are out
 * of reach there and are switched off rather than left to pass quietly:
 * **contrast**, which needs computed colour, and **whether a focus ring is
 * actually drawn**, which needs a box to draw it in. Those two are most of
 * what "accessible" is usually taken to mean, so a kit that claims it and
 * measures neither is claiming something.
 *
 * Deliberately narrow. This is not a second test suite for the components —
 * their behaviour is covered, fast, in jsdom, and moving it here would buy
 * nothing and cost a browser per run. It answers the two questions that
 * cannot be answered anywhere else, on the page that already renders every
 * component in every material and palette.
 *
 * It is its own command and its own CI job, not part of `pnpm check`: that
 * command has to stay something you run before every commit.
 */
export default defineConfig({
  testDir: './browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: process.env['CI'] ? 'github' : 'list',

  use: {
    baseURL: 'http://127.0.0.1:4173',
    /* The page is long and every component is on it; a small window would
       leave most of them outside the layout axe measures against. */
    viewport: { width: 1440, height: 1200 },
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'pnpm showcase:build && pnpm exec vite preview --config vite.showcase.config.ts --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
})
