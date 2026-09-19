<script setup lang="ts">
import { Github, Mail } from 'lucide-vue-next'

/**
 * Who made this, where the other two apps put it: bottom left, small, and
 * out of the way of the thing being read.
 *
 * The address is written with "[ at ]" instead of a mailto link, the same way
 * Hibi and Kakei write it, so a scraper reading the page gets nothing it can
 * send to.
 */
const { compact = false } = defineProps<{
  /** One line, for the sidebar. The footer shows the full card. */
  compact?: boolean
}>()
</script>

<template>
  <div class="ac" :class="{ 'is-compact': compact }">
    <span class="ac-mark" aria-hidden="true">R</span>
    <div class="min-w-0">
      <p class="ac-name">Made by Ramazan Doğan</p>
      <div class="ac-links">
        <a
          class="ac-link focus-ring"
          href="https://github.com/ramazandogna"
          target="_blank"
          rel="noopener"
        >
          <Github class="size-3.5" aria-hidden="true" />
          ramazandogna
        </a>
        <span class="ac-link">
          <Mail class="size-3.5" aria-hidden="true" />
          doganrmzn40 [ at ] gmail.com
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ac {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ac-mark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-on-primary);
  font-size: 0.875rem;
  font-weight: 700;
}

.ac.is-compact .ac-mark {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.75rem;
}

.ac-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink);
}

.ac-links {
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.875rem;
}

.ac.is-compact .ac-links {
  flex-direction: column;
}

.ac-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-cell);
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

a.ac-link:hover {
  color: var(--color-primary);
}
</style>
