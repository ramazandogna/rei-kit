/**
 * Words the home page says twice: once in the app (`FaqSection.vue`) and once
 * in the static HTML a crawler reads before hydration, written by
 * `scripts/prerender-showcase.mjs`, which also turns the FAQ into FAQPage
 * JSON-LD. One source, so the visible answers and the structured data cannot
 * drift. Plain data and erasable TypeScript only, so Node can import it.
 * Every claim here is backed by the README, the tests or bench/results.json.
 */
export const HOME_H1 = 'Accessible Vue 3 component library for Tailwind CSS 4'

export interface Faq {
  q: string
  a: string
}

export const FAQ: Faq[] = [
  {
    q: 'What is rei-kit?',
    a: 'rei-kit is an open-source Vue 3 component library and design system for Tailwind CSS 4. Every component is themed by role, not by colour, so four materials (quiet, glassmorphism, neobrutalism and soft), ten palettes and light or dark mode all work from the same markup.',
  },
  {
    q: 'Does it support Tailwind CSS 4?',
    a: 'Yes, Tailwind CSS 4 is the only target. You import tailwindcss and then the kit’s tokens.css, materials.css and palettes.css; the tokens are plain CSS custom properties, so there is no Tailwind config to extend. Tailwind 3 and Vue 2 are not supported.',
  },
  {
    q: 'Does it work with Nuxt and server-side rendering?',
    a: 'Yes. In Nuxt it is a plain Vue dependency: import components from rei-kit as usual. Every component is SSR-safe, and a test renders each one on a server. There is no Nuxt module, and none is needed.',
  },
  {
    q: 'How accessible are the components?',
    a: 'Components follow WAI-ARIA patterns for keyboard use, focus and labelling, and every palette is checked against WCAG AA contrast in light and dark. Overlays trap and return focus, and motion turns off under prefers-reduced-motion.',
  },
  {
    q: 'How do I switch themes?',
    a: 'Set one attribute on the root element: data-material picks the material, data-palette the palette, and a dark class picks the mode. No component changes; every surface follows.',
  },
  {
    q: 'How big is it, and is it tree-shakeable?',
    a: 'Each component is its own tree-shakeable module with no runtime dependencies. In the repository’s bench (minified and gzipped, Vue excluded), a button, an input and a modal cost about 3.8 KB of JavaScript and ten components about 8.9 KB; the shared stylesheet is about 23 KB whatever you import.',
  },
  {
    q: 'What license is it under?',
    a: 'MIT. It is free for personal and commercial use, and the source is on GitHub.',
  },
  {
    q: 'How is it different from shadcn-vue, Nuxt UI, PrimeVue or Vuetify?',
    a: 'rei-kit is an npm package you update, not code you copy in, and it ships one role-based token system that changes material and palette at runtime. PrimeVue and Vuetify are larger and older, with more components and enterprise features; shadcn-vue gives you the source to own; Nuxt UI is built around Nuxt. Pick rei-kit if you want Tailwind 4, runtime theming and a small dependency-free footprint.',
  },
]
