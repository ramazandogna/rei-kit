import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
 * - the list of all 120 names into the placeholder in `index.html`, so the
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

/* The route table the app itself uses for its head tags (plain TypeScript,
   which Node 22 imports natively), so the static file and the hydrated page
   carry the same title and description. */
const { STATIC_META, NOT_FOUND_META, HOME_META } = await import(
  new URL('./showcase/head-meta.ts', root).href
)

const catalogue = JSON.parse(
  readFileSync(fileURLToPath(new URL('./showcase/props.generated.json', root)), 'utf8'),
)
const examples = JSON.parse(
  readFileSync(fileURLToPath(new URL('./showcase/examples.generated.json', root)), 'utf8'),
)

/* The summaries are written for an editor, where a backtick is code. There is
   no stylesheet in front of this one, so a backtick here is just a backtick. */
const plain = (value) => String(value).replaceAll('`', '')

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

/* The built shell's own module script and stylesheets, so a deep link to a
   stub boots the app: `createApp().mount('#app')` replaces the stub. */
const built = readFileSync(`${out}index.html`, 'utf8')
const assetTags = [
  ...built.matchAll(
    /<(?:script\b[^>]*type="module"[^>]*><\/script>|link\b[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>)/g,
  ),
]
  .map((m) => m[0])
  .join('\n    ')

const themeScript = `<script>
      try {
        var t = localStorage.getItem('rei-theme')
        if (t === 'dark' || ((!t || t === 'system') && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark')
        var p = localStorage.getItem('rei-palette')
        if (p && p !== 'rei') document.documentElement.dataset.palette = p
        var m = localStorage.getItem('rei-material')
        if (m && m !== 'quiet') document.documentElement.dataset.material = m
      } catch (error) {}
    </script>`

const absolute = (path) => (path ? `${site}${path}/` : site)

function breadcrumbs(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'rei-kit', path: '' }, ...crumbs].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  }
}

/* `<` escaped so a summary can never close the script element. */
const ldJson = (graph) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replaceAll(
    '<',
    '\\u003c',
  )

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
    <title>${escape(component.name)} — Vue 3 component — rei-kit</title>
    <meta name="description" content="${escape(plain(component.summary))} Accessible, typed and themed for Tailwind CSS 4. Import from ${escape(component.entry)}." />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escape(component.name)} — rei-kit" />
    <meta property="og:description" content="${escape(plain(component.summary))}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${site}og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(component.name)} — rei-kit" />
    <meta name="twitter:description" content="${escape(plain(component.summary))}" />
    <script type="application/ld+json">
${ldJson([
  {
    '@type': 'SoftwareSourceCode',
    name: component.name,
    description: plain(component.summary),
    url,
    codeRepository: 'https://github.com/ramazandogna/rei-kit',
    programmingLanguage: ['TypeScript', 'Vue'],
    runtimePlatform: 'Vue 3',
    license: 'https://opensource.org/licenses/MIT',
    isPartOf: { '@type': 'SoftwareSourceCode', name: 'rei-kit', url: site },
    author: { '@type': 'Person', name: 'Ramazan Dogan' },
  },
  breadcrumbs([
    { name: 'Components', path: 'components' },
    { name: component.name, path: `c/${component.name}` },
  ]),
])}
    </script>
    ${themeScript}
    ${assetTags}
    <style>
      /* Everything is scoped to .stub: the app mounts into #app and replaces
         it, and none of this may outlive that. */
      body:has(.stub) { margin: 0; color: #0f2229; background: #f4faf8 }
      .stub { margin: 0 auto; max-width: 68rem; padding: 2rem 1.25rem 4rem; font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6 }
      @media (prefers-color-scheme: dark) { body:has(.stub) { color: #e6f0ee; background: #07141a } .stub a { color: #5fb0c9 } .stub code, .stub pre { background: #102630 } .stub th, .stub td { border-color: #1c3945 } }
      .stub a { color: #26667f }
      .stub code, .stub pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #ffffff; border-radius: 6px }
      .stub code { padding: 0.1em 0.35em; font-size: 0.9em }
      .stub pre { padding: 1rem; overflow-x: auto; font-size: 0.8125rem }
      .stub table { width: 100%; border-collapse: collapse; font-size: 0.875rem }
      .stub caption { text-align: start; font-weight: 600; padding-block: 0.75rem }
      .stub th, .stub td { border-bottom: 1px solid #e1edea; padding: 0.5rem 0.6rem; text-align: start; vertical-align: top }
      .stub nav { font-size: 0.875rem; margin-bottom: 1.5rem }
    </style>
  </head>
  <body>
    <div id="app"><div class="stub">
    <nav aria-label="Breadcrumb"><a href="${site}">rei-kit</a> › <a href="${site}components/">Components</a> › ${escape(component.name)}</nav>
    <h1>${escape(component.name)}</h1>
    <p>${escape(plain(component.summary))}</p>
    <p>
      Import it from <code>${escape(component.entry)}</code>:
      <code>import { ${escape(component.name)} } from '${escape(component.entry)}'</code>
    </p>
    <p>
      <a href="${site}components/">Browse every component</a> in the live documentation, in four
      materials and ten palettes.
    </p>
    ${example ? `<h2>Usage</h2>\n    <pre><code>${escape(example.ts)}</code></pre>` : ''}
    <h2>Props</h2>
    ${propRows(component.props)}
    <h2>About rei-kit</h2>
    <p>
      rei-kit is an accessible Vue 3 and Tailwind CSS 4 component library: 120 components, themed by
      role rather than by colour on three independent axes — ten WCAG-checked palettes, four
      materials and light or dark, each switched with one attribute. Typed, tested, SSR-safe, no
      runtime dependencies, MIT.
    </p>
    <p>
      <code>pnpm add rei-kit</code> ·
      <a href="https://www.npmjs.com/package/rei-kit">rei-kit on npm</a> ·
      <a href="https://github.com/ramazandogna/rei-kit">Source on GitHub</a>
    </p>
    </div></div>
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
      `<li><a href="${base}c/${component.name}/">${escape(component.name)}</a> — ${escape(plain(component.summary))}</li>`,
  )
  .join('\n          ')

writeFileSync(
  shell,
  readFileSync(shell, 'utf8').replace(
    '<!-- prerender:components -->',
    `<section class="boot-index">\n        <h2>All ${catalogue.length} components</h2>\n        <ul>\n          ${list}\n        </ul>\n        </section>`,
  ),
)

/* Each top-level route gets a real file, so Pages answers /components/,
   /themes/ and /docs/<slug>/ with a 200 and this route's own head, instead
   of the 404 fallback with the home page's title. The body is the same boot
   shell (the app replaces it on mount); only the crawler-facing h1 and the
   head tags change. */
const shellHtml = readFileSync(shell, 'utf8')

/* The route chunk is only requested once the entry has run and the router
   has resolved, a waterfall of two round trips on a slow link. Preloading it
   (and its static imports, CSS included) from the HTML lets it download in
   parallel with the entry. */
const manifest = JSON.parse(readFileSync(`${out}.vite/manifest.json`, 'utf8'))
function preloadsFor(page) {
  const key = `pages/${page}.vue`
  if (!manifest[key]) return ''
  const seen = new Set()
  const js = []
  const css = new Set()
  const walk = (id) => {
    if (seen.has(id) || manifest[id]?.isEntry) return
    seen.add(id)
    const chunk = manifest[id]
    js.push(chunk.file)
    for (const file of chunk.css ?? []) css.add(file)
    for (const dep of chunk.imports ?? []) walk(dep)
  }
  walk(key)
  const already = (file) => shellHtml.includes(`${base}${file}`)
  return [
    ...[...css]
      .filter((f) => !already(f))
      .map((f) => `<link rel="preload" as="style" crossorigin href="${base}${f}">`),
    ...js
      .filter((f) => !already(f))
      .map((f) => `<link rel="modulepreload" crossorigin href="${base}${f}">`),
  ].join('\n    ')
}
const PAGE_FOR = { '': 'HomePage', components: 'CatalogPage', themes: 'ThemesPage' }
const pageFor = (path) => PAGE_FOR[path] ?? (path.startsWith('docs') ? 'DocsPage' : undefined)

function withHead(html, meta, { noindex = false } = {}) {
  const url = absolute(meta.path)
  const title = escape(meta.title)
  const description = escape(meta.description)
  const preload = pageFor(meta.path) ? preloadsFor(pageFor(meta.path)) : ''
  let next = html
    .replace('</head>', preload ? `  ${preload}\n  </head>` : '</head>')
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*"/, `$1${description}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${description}"`)
    .replace(/(<meta name="twitter:title"\s+content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*"/, `$1${description}"`)
  if (noindex) {
    next = next
      .replace(/\s*<link rel="canonical"[^>]*>/, '\n    <meta name="robots" content="noindex" />')
      .replace(/\s*<meta property="og:url"[^>]*>/, '')
  } else {
    next = next
      .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
      .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
  }
  if (meta.path && !noindex) {
    next = next
      .replace(
        /(<main class="boot">\s*<h1>)[^<]*(<\/h1>)/,
        `$1${escape(meta.title.replace(/ — rei-kit.*$/, ''))}$2`,
      )
      .replace(
        '</head>',
        `  <script type="application/ld+json">\n${ldJson([breadcrumbs(meta.crumbs)])}\n    </script>\n  </head>`,
      )
  }
  return next
}

writeFileSync(shell, withHead(shellHtml, HOME_META))

for (const meta of STATIC_META) {
  if (!meta.path) continue
  mkdirSync(`${out}${meta.path}/`, { recursive: true })
  writeFileSync(`${out}${meta.path}/index.html`, withHead(shellHtml, meta))
}
/* /docs/ itself is the install page; same words, canonical to the slug. */
mkdirSync(`${out}docs/`, { recursive: true })
writeFileSync(
  `${out}docs/index.html`,
  withHead(
    shellHtml,
    STATIC_META.find((m) => m.path === 'docs/install'),
  ),
)

/* Anything else still boots the app from 404.html (Pages serves it with a
   404 status), so the router can draw its not-found page. Never indexed. */
writeFileSync(`${out}404.html`, withHead(shellHtml, NOT_FOUND_META, { noindex: true }))

const urls = [
  ...STATIC_META.map((meta) => absolute(meta.path)),
  ...catalogue.map((component) => `${site}c/${component.name}/`),
]
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

/* The manifest is a build input, not part of the site. */
rmSync(`${out}.vite`, { recursive: true, force: true })

console.log(
  `prerender-showcase: ${catalogue.length} component pages, a sitemap of ${urls.length} URLs, and the shell names them all`,
)
