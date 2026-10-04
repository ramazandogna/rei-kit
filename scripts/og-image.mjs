import { readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { chromium } from '@playwright/test'

/**
 * The 1200×630 card every link to this kit shows.
 *
 * Painted with the kit's own compiled stylesheet rather than drawn in a
 * design tool, so the image cannot describe a look the package no longer
 * has: the four tiles below are the four materials, rendered by the same
 * CSS an app installs. Run after `showcase:build`, because that is what
 * produces the stylesheet it reads.
 *
 * Checked in, because a social card has to exist as a file at a URL — a
 * crawler will not run a build to see one.
 */
const root = new URL('../', import.meta.url)
const assets = fileURLToPath(new URL('./dist-showcase/assets/', root))
const css = readdirSync(assets).find((file) => file.endsWith('.css'))

if (!css) throw new Error('No built stylesheet. Run `pnpm showcase:build` first.')

const page = `<!doctype html>
<html lang="en" data-palette="rei">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="./assets/${css}" />
    <style>
      body { margin: 0; width: 1200px; height: 630px; overflow: hidden }
      .og { display: grid; grid-template-rows: auto 1fr; gap: 2rem; height: 100%; padding: 3.5rem 4rem }
      .og-kicker { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 1.125rem; letter-spacing: 0.08em; text-transform: uppercase }
      .og-title { margin: 0.75rem 0 0; font-size: 3.75rem; line-height: 1.02; font-weight: 700; letter-spacing: -0.03em }
      .og-lead { margin: 1rem 0 0; font-size: 1.375rem; line-height: 1.45; max-width: 46ch }
      .og-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; align-items: stretch }
      .og-frame { border-radius: 1.25rem; padding: 0.875rem }
      .og-tile { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem; height: 100% }
      .og-name { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9375rem; font-weight: 600 }
      .og-bar { height: 0.5rem; border-radius: 9999px }
      .og-chip { align-self: flex-start; padding: 0.3rem 0.7rem; font-size: 0.8125rem; border-radius: 9999px }
    </style>
  </head>
  <body class="canvas">
    <div class="og">
      <header>
        <p class="og-kicker text-primary">Vue 3 · Tailwind 4</p>
        <h1 class="og-title text-ink">106 accessible components.<br />Four materials. Ten palettes.</h1>
        <p class="og-lead text-ink-soft">
          One kit, every look — each axis switched with a single attribute, without touching a
          component.
        </p>
      </header>

      <div class="og-row">
        ${[
          ['quiet', 'rei'],
          ['glass', 'nord'],
          ['brutal', 'sakura'],
          ['soft', 'gruvbox'],
        ]
          .map(
            ([material, palette]) => `<div data-material="${material}" data-palette="${palette}" class="canvas og-frame">
          <div class="surface rounded-card og-tile">
            <p class="og-name text-ink">${material} · ${palette}</p>
            <div class="og-bar bg-primary"></div>
            <div class="og-bar bg-accent" style="width: 80%"></div>
            <div class="og-bar bg-positive" style="width: 55%"></div>
            <p class="og-chip control text-ink">rounded-card</p>
          </div>
        </div>`,
          )
          .join('\n        ')}
      </div>
    </div>
  </body>
</html>
`

const file = fileURLToPath(new URL('./dist-showcase/og-source.html', root))
writeFileSync(file, page)

const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await tab.goto(`file://${file}`)
await tab.waitForTimeout(400)
await tab.screenshot({
  path: fileURLToPath(new URL('./showcase/public/og.png', root)),
  clip: { x: 0, y: 0, width: 1200, height: 630 },
})
await browser.close()

console.log('og-image: showcase/public/og.png, 1200×630, painted with the published stylesheet')
