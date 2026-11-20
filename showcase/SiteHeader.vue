<script setup lang="ts">
import { Menu, Search } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseKbd, BaseSheet, VERSION } from '../src/index'
import { REPO } from './catalog'

/**
 * One row, 56px. Logo and version, three links, the palette button and
 * GitHub. Under 768px the links move into a sheet.
 */
defineEmits<{ find: [] }>()

const SERIES = VERSION.split('.').slice(0, 2).join('.')
const LINKS = [
  { to: '/components', label: 'Components' },
  { to: '/themes', label: 'Themes' },
  { to: '/docs', label: 'Docs' },
]

const scrolled = ref(false)
const menu = ref(false)
const mac = ref(true)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  mac.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="sh" :class="{ 'is-scrolled': scrolled }">
    <div class="site-page sh-row">
      <RouterLink to="/" class="sh-brand focus-ring">
        <span class="sc-logo" aria-hidden="true">零</span>
        <span class="sh-name">rei-kit</span>
        <span class="sh-ver site-mono" :title="`v${VERSION}`">v{{ SERIES }}</span>
      </RouterLink>

      <nav class="sh-nav" aria-label="Site">
        <RouterLink
          v-for="link in LINKS"
          :key="link.to"
          :to="link.to"
          class="sh-link focus-ring"
          active-class="is-active"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <span class="sh-spacer" />

      <button type="button" class="sh-find focus-ring" @click="$emit('find')">
        <Search class="size-4" aria-hidden="true" />
        <span class="sh-find-text">Search</span>
        <BaseKbd class="sh-find-kbd" :keys="[mac ? '⌘' : 'Ctrl', 'K']" joiner="+" />
        <span class="sr-only">the kit</span>
      </button>

      <a
        class="sh-gh focus-ring"
        :href="REPO"
        target="_blank"
        rel="noopener"
        aria-label="rei-kit on GitHub"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
          <path
            d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
          />
        </svg>
      </a>

      <button
        type="button"
        class="sh-menu focus-ring"
        aria-label="Menu"
        :aria-expanded="menu"
        @click="menu = true"
      >
        <Menu class="size-5" aria-hidden="true" />
      </button>
    </div>

    <BaseSheet v-model="menu" title="rei-kit" close-label="Close">
      <nav class="sh-sheet" aria-label="Site">
        <RouterLink v-for="link in LINKS" :key="link.to" :to="link.to" @click="menu = false">
          {{ link.label }}
        </RouterLink>
        <a :href="REPO" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.npmjs.com/package/rei-kit" target="_blank" rel="noopener">npm</a>
      </nav>
    </BaseSheet>
  </header>
</template>

<style scoped>
.sh {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 56px;
  view-transition-name: site-header;
  background: color-mix(in oklab, var(--color-canvas) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: var(--surface-border-width) solid transparent;
}
.sh.is-scrolled {
  border-bottom-color: var(--color-hair);
}
.sh-row {
  display: flex;
  height: 56px;
  align-items: center;
  gap: 8px;
}
.sh-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-inline-end: 16px;
  border-radius: var(--radius-control);
}
.sh-name {
  font-weight: 600;
  letter-spacing: -0.01em;
}
.sh-ver {
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.sh-nav {
  display: none;
  gap: 4px;
}
.sh-link {
  border-radius: var(--radius-control);
  padding: 6px 12px;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
  transition: color var(--site-dur-1) var(--site-ease-out);
}
.sh-link:hover,
.sh-link.is-active {
  color: var(--color-ink);
}
.sh-link.is-active {
  font-weight: 600;
}
.sh-spacer {
  flex: 1;
}
.sh-find {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-control);
  padding: 0 10px;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.sh-find:hover {
  color: var(--color-ink);
  border-color: var(--color-primary);
}
.sh-find-text,
.sh-find-kbd {
  display: none;
}
.sh-gh,
.sh-menu {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: var(--radius-control);
  color: var(--color-ink-soft);
}
.sh-gh {
  display: none;
}
.sh-gh:hover,
.sh-menu:hover {
  color: var(--color-ink);
}
.sh-sheet {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sh-sheet a {
  padding: 12px 8px;
  font-size: var(--site-text-lg);
}
@media (min-width: 48rem) {
  .sh-nav {
    display: flex;
  }
  .sh-find-text,
  .sh-find-kbd {
    display: inline-flex;
  }
  .sh-find {
    min-width: 12rem;
  }
  .sh-gh {
    display: grid;
  }
  .sh-menu {
    display: none;
  }
}
</style>
