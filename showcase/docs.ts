/**
 * The docs pages, in sidebar order. The command palette and the docs route
 * both read this, so a page cannot be searchable and missing, or the reverse.
 * `sections` are the H2s on the page: the right rail and ⌘K link to them.
 */
export const DOC_PAGES = [
  {
    slug: 'install',
    title: 'Install',
    summary: 'From an empty folder to your first themed screen.',
    sections: [
      { id: 'runs-on', label: 'Runs on' },
      { id: 'start', label: 'Get started' },
    ],
  },
  {
    slug: 'theming',
    title: 'Theming',
    summary: 'Materials, palettes and mode, and how to override one part.',
    sections: [
      { id: 'axes', label: 'Three axes' },
      { id: 'override', label: 'Override one component' },
    ],
  },
  {
    slug: 'motion',
    title: 'Motion',
    summary: 'Things that move, on purpose, and what reduced motion does.',
    sections: [
      { id: 'motion', label: 'Parts' },
      { id: 'reduced', label: 'Reduced motion' },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    summary: 'WCAG AA palettes, APG keyboard patterns, tested.',
    sections: [{ id: 'what', label: 'What is covered' }],
  },
  {
    slug: 'performance',
    title: 'Size and speed',
    summary: 'Smaller as you use more of it.',
    sections: [{ id: 'evidence', label: 'Evidence' }],
  },
  {
    slug: 'rtl',
    title: 'Right to left',
    summary: 'Every component mirrors, arrow keys included.',
    sections: [{ id: 'try', label: 'Try it' }],
  },
  {
    slug: 'check',
    title: 'Check your setup',
    summary: 'Find out why a component renders unstyled.',
    sections: [{ id: 'run', label: 'Run the check' }],
  },
] as const

export type DocSlug = (typeof DOC_PAGES)[number]['slug']
