import { DOC_PAGES } from './docs.ts'

/**
 * Title, description and breadcrumb for every route that is not a component
 * page. One table, read twice: by the router at runtime (`head.ts`) and by
 * `scripts/prerender-showcase.mjs`, which writes the same words into the
 * static `index.html` each route is served from. Plain data and erasable
 * TypeScript only, so Node can import it without a build step.
 */
export const SITE_URL = 'https://ramazandogna.github.io/rei-kit/'

export interface RouteMeta {
  /** Path relative to the site root, without a leading slash: '' for home. */
  path: string
  title: string
  description: string
  /** Visible label for the breadcrumb; home is implied. */
  crumbs: { name: string; path: string }[]
}

export const HOME_META: RouteMeta = {
  path: '',
  title: 'rei-kit — accessible Vue 3 + Tailwind 4 component library',
  description:
    '120 accessible Vue 3 components for Tailwind CSS 4: a design system with four materials (quiet, glassmorphism, neobrutalism, soft) and ten WCAG-checked palettes, each switched with one attribute. TypeScript, SSR-safe, MIT.',
  crumbs: [],
}

export const STATIC_META: RouteMeta[] = [
  HOME_META,
  {
    path: 'components',
    title: 'All 120 Vue 3 components — rei-kit',
    description:
      'Browse every rei-kit component by category: forms, overlays, navigation, data tables and charts, motion and app shells. Each one is accessible, typed and themed by role for Tailwind CSS 4.',
    crumbs: [{ name: 'Components', path: 'components' }],
  },
  {
    path: 'themes',
    title: 'Themes: materials and palettes — rei-kit',
    description:
      'Four materials — quiet, glass, brutal and soft — and ten WCAG AA palettes in light and dark. Preview them live and switch the whole Vue component library with one attribute.',
    crumbs: [{ name: 'Themes', path: 'themes' }],
  },
  ...DOC_PAGES.map((doc): RouteMeta => ({
    path: `docs/${doc.slug}`,
    title: `${doc.title} — rei-kit docs`,
    description: `${doc.summary} Documentation for rei-kit, the accessible Vue 3 and Tailwind CSS 4 component library.`,
    crumbs: [
      { name: 'Docs', path: 'docs/install' },
      { name: doc.title, path: `docs/${doc.slug}` },
    ],
  })),
]

export const NOT_FOUND_META: RouteMeta = {
  path: '404',
  title: 'Page not found — rei-kit',
  description: 'This page does not exist. Browse the rei-kit Vue 3 components instead.',
  crumbs: [],
}

/** `path` without slashes at either end, e.g. 'docs/motion'. */
export function metaForPath(path: string): RouteMeta | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '')
  if (clean === 'docs') return STATIC_META.find((m) => m.path === 'docs/install')
  return STATIC_META.find((m) => m.path === clean)
}
