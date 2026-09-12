<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * The person, in the corner where the account lives.
 *
 * ## Why the default is a glyph and not an initial
 *
 * An initial in a circle reads as a profile picture that failed to load, and it
 * says nothing at all to somebody who has never seen an avatar in that spot
 * before — which is most people, the first time. A drawn person says "this is
 * you" without knowing your name. So `fallback` defaults to the figure, and
 * initials are available for the places where the name is the point: a list of
 * members, a comment thread, anywhere several people appear at once and telling
 * them apart is the job.
 *
 * An image that fails is caught and falls back rather than leaving a broken
 * frame, because a missing avatar is normal and a broken image is an error.
 */
const {
  name = '',
  src = '',
  size = 'md',
  fallback = 'figure',
  label = '',
} = defineProps<{
  /** Used for the initials and, failing a `label`, as the accessible name. */
  name?: string | undefined
  src?: string | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  fallback?: 'figure' | 'initials' | undefined
  /** Overrides the accessible name. For "Your account" rather than a person's name. */
  label?: string | undefined
}>()

const broken = ref(false)
watch(
  () => src,
  () => (broken.value = false),
)

const showImage = computed(() => Boolean(src) && !broken.value)

/**
 * Two letters at most, from the first and last word.
 *
 * `Array.from` rather than `slice`, so a name written in a script outside the
 * basic plane is cut between characters rather than through one.
 */
const initials = computed(() => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  const first = Array.from(words[0]!)[0] ?? ''
  const last = words.length > 1 ? (Array.from(words[words.length - 1]!)[0] ?? '') : ''

  return (first + last).toUpperCase()
})

const accessibleName = computed(() => label || name)
</script>

<template>
  <span
    class="rk-avatar"
    :class="`is-${size}`"
    :role="accessibleName ? 'img' : undefined"
    :aria-label="accessibleName || undefined"
    :aria-hidden="accessibleName ? undefined : 'true'"
  >
    <img v-if="showImage" :src="src" alt="" class="rk-avatar-img" @error="broken = true" />

    <span v-else-if="fallback === 'initials' && initials" class="rk-avatar-initials">
      {{ initials }}
    </span>

    <svg v-else viewBox="0 0 20 20" class="rk-avatar-figure" fill="none" stroke="currentColor">
      <circle cx="10" cy="6.75" r="3.25" stroke-width="1.5" />
      <path
        d="M3.75 17c0-3.05 2.8-5.25 6.25-5.25S16.25 13.95 16.25 17"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.rk-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-cell);
  border: 1px solid color-mix(in srgb, var(--color-hair) 70%, transparent);
  background: var(--color-surface);
  color: var(--color-ink-soft);
}

.is-sm {
  width: 1.75rem;
  height: 1.75rem;
}

.is-md {
  width: 2.25rem;
  height: 2.25rem;
}

.is-lg {
  width: 3rem;
  height: 3rem;
}

.rk-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rk-avatar-initials {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-ink);
}

.is-lg .rk-avatar-initials {
  font-size: 1rem;
}

.rk-avatar-figure {
  width: 65%;
  height: 65%;
}
</style>
