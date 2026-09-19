<script setup lang="ts">
import { MATERIALS, PALETTES, PageContainer, VERSION } from '../src/index'
import catalogue from './props.generated.json'
import AuthorCredit from './AuthorCredit.vue'

/**
 * The end of the page: where to go next, where the code lives, and who to
 * thank or blame.
 *
 * Every number in it is read from the package, like the ones in the hero,
 * so the footer cannot promise a component count the kit does not have.
 */
const COLUMNS = [
  {
    title: 'Docs',
    links: [
      { label: 'Get started', href: '#start' },
      { label: 'Materials & palettes', href: '#axes' },
      { label: 'Motion', href: '#hareket' },
      { label: 'Every component', href: '#api' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: 'https://github.com/ramazandogna/rei-kit' },
      { label: 'npm', href: 'https://www.npmjs.com/package/rei-kit' },
      {
        label: 'Changelog',
        href: 'https://github.com/ramazandogna/rei-kit/blob/main/CHANGELOG.md',
      },
      { label: 'Report an issue', href: 'https://github.com/ramazandogna/rei-kit/issues' },
    ],
  },
  {
    title: 'Built on it',
    links: [
      { label: 'Hibi — a phone journal', href: 'https://github.com/ramazandogna/hibi' },
      { label: 'Kakei — a phone ledger', href: 'https://github.com/ramazandogna/kakei' },
      {
        label: 'Kakehashi — a course site',
        href: 'https://github.com/ramazandogna/kakehashi-nihongo',
      },
    ],
  },
]

const external = (href: string) => href.startsWith('http')
const year = new Date().getFullYear()
</script>

<template>
  <footer id="credits" class="sf">
    <PageContainer>
      <div class="sf-grid">
        <div class="sf-brand">
          <a href="#top" class="flex items-center gap-2.5">
            <span class="sf-logo" aria-hidden="true">零</span>
            <span class="text-ink text-base font-semibold tracking-tight">rei-kit</span>
          </a>
          <p class="text-ink-soft mt-3 max-w-[30ch] text-sm leading-relaxed">
            One kit, every look. {{ catalogue.length }} components,
            {{ MATERIALS.length }} materials, {{ PALETTES.length }} palettes — for Vue 3 and
            Tailwind CSS 4.
          </p>
          <AuthorCredit class="mt-6" />
        </div>

        <nav v-for="column in COLUMNS" :key="column.title" :aria-label="column.title">
          <h2 class="sf-title">{{ column.title }}</h2>
          <ul class="mt-3 flex flex-col gap-2">
            <li v-for="link in column.links" :key="link.label">
              <a
                class="sf-link focus-ring"
                :href="link.href"
                :target="external(link.href) ? '_blank' : undefined"
                :rel="external(link.href) ? 'noopener' : undefined"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="sf-bottom">
        <p>© {{ year }} Ramazan Doğan · MIT licence</p>
        <p class="tabular-nums">v{{ VERSION }} · published from CI with npm provenance</p>
      </div>
    </PageContainer>
  </footer>
</template>

<style scoped>
.sf {
  margin-top: 6rem;
  border-top: 1px solid var(--surface-border-color);
  background: color-mix(in oklab, var(--color-surface) 60%, transparent);
  padding: 3.5rem 0 2rem;
}

.sf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem 1.5rem;
}

.sf-brand {
  grid-column: 1 / -1;
}

@media (min-width: 48rem) {
  .sf-grid {
    grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr));
  }

  .sf-brand {
    grid-column: auto;
  }
}

.sf-logo {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-on-primary);
  font-size: 1rem;
  font-weight: 700;
}

.sf-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink);
}

.sf-link {
  border-radius: var(--radius-cell);
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  transition: color var(--duration-fast) var(--ease-standard);
}

.sf-link:hover {
  color: var(--color-primary);
}

/* Room for the floating Contents button a phone gets, so it never sits on the
   last line of the page. */
@media (max-width: 63.99rem) {
  .sf {
    padding-bottom: 6rem;
  }
}

.sf-bottom {
  margin-top: 3rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  border-top: 1px solid var(--surface-border-color);
  padding-top: 1.5rem;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}
</style>
