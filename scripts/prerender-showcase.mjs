import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

/**
 * Static pages for a client-rendered gallery.
 *
 * The showcase is one Vite SPA, which means the file a crawler is served is
 * an empty `<div id="app">`: 716 bytes with no prose, no links and no
 * component names. Google renders JavaScript on a second, best-effort pass;
 * Bing, DuckDuckGo, every social unfurler and most of the crawlers that feed
 * an answer engine do not. And with `createMemoryHistory` the address bar
 * never changes, so there was no URL to rank for a single component even if
 * one of them had been read.
 *
 * So this runs after `vite build` and writes, from the two files the build
 * already generates:
 *
 * - one static page per component at `c/<Name>/`, with its summary, its real
 *   prop table as a `<table>` and its usage sample as `<pre>` — no
 *   JavaScript, so it is instant and indexable as-is,
 * - the list of all 106 names into the placeholder in `index.html`, so the
 *   shell a crawler gets before hydration names every part,
 * - `sitemap.xml`.
 *
 * Not a Vue SSR pass: the gallery mounts 22,800 nodes and renders four
 * materials of live demos, none of which belongs in a static document. What
 * a search needs is the words.
 */
const root = new URL('../', import.meta.url)
const out = fileURLToPath(new URL('./dist-showcase/', root))
/* Two different things, and conflating them wrote a canonical URL that was
   wrong in every local build: `base` is the path assets are served from and
   changes between a local build and Pages, while the canonical origin is a
   fact about where this site lives and must not. */
const base = process.env['SHOWCASE_BASE'] ?? '/'
const site = process.env['SHOWCASE_SITE'] ?? 'https://ramazandogna.github.io/rei-kit/'

const catalogue = JSON.parse(
  readFileSync(fileURLToPath(new URL('./showcase/props.generated.json', root)), 'utf8'),
)
const examples = JSON.parse(
  readFileSync(fileURLToPath(new URL('./showcase/examples.generated.json', root)), 'utf8'),
)

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function propRows(props) {
  if (props.length === 0) return '<p>This component takes no props.</p>'

  const rows = props
    .map(
      (prop) =>
        `<tr><td><code>${escape(prop.name)}</code></td><td><code>${escape(prop.type)}</code></td><td>${
          prop.required ? 'yes' : escape(prop.default ?? '—')
        }</td><td>${escape(prop.description ?? '')}</td></tr>`,
    )
    .join('\n')

  return `<table><caption>Props</caption><thead><tr><th>Prop</th><th>Type</th><th>Required or default</th><th>What it is for</th></tr></thead><tbody>\n${rows}\n</tbody></table>`
}

function page(component) {
  const example = examples.find((item) => item.name === component.name)
  const url = `${site}c/${component.name}/`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(component.name)} — rei-kit Vue 3 component</title>
    <meta name="description" content="${escape(component.summary)} ${escape(component.name)} is part of rei-kit, an accessible Vue 3 + Tailwind 4 component library. Imported from ${escape(component.entry)}." />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escape(component.name)} — rei-kit" />
    <meta property="og:description" content="${escape(component.summary)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${site}og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">
${JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${component.name} — rei-kit`,
    description: component.summary,
    url,
    isPartOf: { '@type': 'WebSite', name: 'rei-kit', url: site },
    author: { '@type': 'Person', name: 'Ramazan Dogan' },
  },
  null,
  2,
)}
    </script>
    <style>
      :root { color-scheme: light dark }
      body { margin: 0 auto; max-width: 68rem; padding: 2rem 1.25rem 4rem; font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0f2229; background: #f4faf8 }
      @media (prefers-color-scheme: dark) { body { color: #e6f0ee; background: #07141a } a { color: #5fb0c9 } code, pre { background: #102630 } th, td { border-color: #1c3945 } }
      a { color: #26667f }
      code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #ffffff; border-radius: 6px }
      code { padding: 0.1em 0.35em; font-size: 0.9em }
      pre { padding: 1rem; overflow-x: auto; font-size: 0.8125rem }
      table { width: 100%; border-collapse: collapse; font-size: 0.875rem }
      caption { text-align: start; font-weight: 600; padding-block: 0.75rem }
      th, td { border-bottom: 1px solid #e1edea; padding: 0.5rem 0.6rem; text-align: start; vertical-align: top }
      nav { font-size: 0.875rem; margin-bottom: 1.5rem }
    </style>
  </head>
  <body>
    <nav><a href="${site}">rei-kit</a> › <a href="${site}#api">Components</a> › ${escape(component.name)}</nav>
    <h1>${escape(component.name)}</h1>
    <p>${escape(component.summary)}</p>
    <p>
      Import it from <code>${escape(component.entry)}</code>:
      <code>import { ${escape(component.name)} } from '${escape(component.entry)}'</code>
    </p>
    <p>
      <a href="${site}#api-${escape(component.name)}">Open ${escape(component.name)} in the live documentation</a>,
      where every prop below is a control you can change, in four materials and ten palettes.
    </p>
    ${example ? `<h2>Usage</h2>\n    <pre><code>${escape(example.ts)}</code></pre>` : ''}
    <h2>Props</h2>
    ${propRows(component.props)}
    <h2>About rei-kit</h2>
    <p>
      rei-kit is an accessible Vue 3 and Tailwind CSS 4 component library: 106 components, themed by
      role rather than by colour on three independent axes — ten WCAG-checked palettes, four
      materials and light or dark, each switched with one attribute. Typed, tested, SSR-safe, no
      runtime dependencies, MIT.
    </p>
    <p>
      <code>pnpm add rei-kit</code> ·
      <a href="https://www.npmjs.com/package/rei-kit">npm</a> ·
      <a href="https://github.com/ramazandogna/rei-kit">GitHub</a>
    </p>
  </body>
</html>
`
}

for (const component of catalogue) {
  const dir = `${out}c/${component.name}/`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}index.html`, page(component))
}

/* The shell every crawler gets before hydration names every component, each
   one linking to its own static page. */
const shell = `${out}index.html`
const list = catalogue
  .map(
    (component) =>
      `<li><a href="${base}c/${component.name}/">${escape(component.name)}</a> — ${escape(component.summary)}</li>`,
  )
  .join('\n          ')

writeFileSync(
  shell,
  readFileSync(shell, 'utf8').replace(
    '<!-- prerender:components -->',
    `<h2>All 106 components</h2>\n        <ul>\n          ${list}\n        </ul>`,
  ),
)

const urls = [site, ...catalogue.map((component) => `${site}c/${component.name}/`)]
writeFileSync(
  `${out}sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${url}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>${url === site ? '1.0' : '0.7'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`,
)

console.log(
  `prerender-showcase: ${catalogue.length} component pages, a sitemap of ${urls.length} URLs, and the shell names them all`,
)
