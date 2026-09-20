<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * A link in a sentence — the one thing a button is not.
 *
 * `BaseButton` has a `link` variant for an action that should read as text;
 * this is the other way round: a real link, to a real place, that navigates.
 * If pressing it does something rather than goes somewhere, it is a button.
 *
 * `to` routes and `href` leaves. A link that leaves in a new tab carries the
 * mark that says so, and `rel="noopener"`, which is not a nicety: without it
 * the page that opens can reach back through `window.opener`.
 */
const {
  to = undefined,
  href = undefined,
  external = undefined,
  tone = 'primary',
  underline = 'hover',
} = defineProps<{
  /** A route. Uses `RouterLink`, so the app needs vue-router. */
  to?: string | Record<string, unknown> | undefined
  /** A URL. Anything not on this site should be `external`. */
  href?: string | undefined
  /** Opens in a new tab, with the mark and the `rel` that belong to that. */
  external?: boolean | undefined
  tone?: 'primary' | 'ink' | undefined
  underline?: 'always' | 'hover' | 'none' | undefined
}>()

defineSlots<{ default: () => unknown }>()

const is = computed(() => (to !== undefined ? RouterLink : 'a'))
</script>

<template>
  <component
    :is="is"
    class="rk-link focus-ring"
    :class="[`tone-${tone}`, `underline-${underline}`]"
    v-bind="
      to !== undefined
        ? { to }
        : {
            href,
            target: external ? '_blank' : undefined,
            rel: external ? 'noopener noreferrer' : undefined,
          }
    "
  >
    <slot />
    <ArrowUpRight v-if="external" class="rk-link-mark" aria-hidden="true" />
  </component>
</template>

<style scoped>
.rk-link {
  display: inline;
  border-radius: var(--radius-cell);
  font-weight: 500;
  text-underline-offset: 0.2em;
  transition: color var(--duration-fast) var(--ease-standard);
}

.rk-link.tone-primary {
  color: var(--color-primary);
}

.rk-link.tone-ink {
  color: var(--color-ink);
}

.rk-link.underline-always {
  text-decoration: underline;
}

.rk-link.underline-hover:hover,
.rk-link.underline-none:hover {
  text-decoration: underline;
}

.rk-link.underline-none:hover {
  text-decoration: none;
}

.rk-link-mark {
  display: inline-block;
  width: 0.875em;
  height: 0.875em;
  vertical-align: -0.1em;
}
</style>
