<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { PALETTES, usePalette } from '../src/index'

/**
 * Ten palettes, each a circle cut into its four defining colours.
 *
 * A radio group rather than a menu, because choosing a palette is choosing
 * one of a set — the same job as a segmented control, only too many options
 * to lay out in a row. So: arrows move the choice, and it applies as it
 * moves, which is the point of a palette picker; you are shopping, not
 * submitting.
 */
const palette = usePalette()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const options = ref<HTMLButtonElement[]>([])

const current = computed(() => PALETTES.find((p) => p.name === palette.value) ?? PALETTES[0]!)

/** A pie in four equal slices. */
const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`

function choose(name: string) {
  palette.value = name
}

async function focusCurrent() {
  await nextTick()
  const index = PALETTES.findIndex((p) => p.name === palette.value)
  options.value[index]?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }

  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
  if (!keys.includes(event.key)) return

  event.preventDefault()
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
  const index = PALETTES.findIndex((p) => p.name === palette.value)
  const next = PALETTES[(index + step + PALETTES.length) % PALETTES.length]!

  choose(next.name)
  void focusCurrent()
}

function onOutside(event: Event) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onOutside)
    void focusCurrent()
  } else {
    document.removeEventListener('pointerdown', onOutside)
  }
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside))
</script>

<template>
  <div ref="root" class="pp">
    <button
      type="button"
      class="pp-trigger control"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="`Palette: ${current.label}`"
      @click="open = !open"
    >
      <span class="pp-dot" :style="{ background: pie(current.swatch) }" aria-hidden="true" />
      <span class="pp-trigger-label">{{ current.label }}</span>
      <svg class="pp-caret" :class="{ 'is-open': open }" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>

    <Transition name="pp-pop">
      <div v-if="open" class="pp-panel surface-overlay" @keydown="onKeydown">
        <p class="pp-title">Palette</p>

        <div class="pp-grid" role="radiogroup" aria-label="Palette">
          <button
            v-for="(p, i) in PALETTES"
            :key="p.name"
            :ref="(el) => (options[i] = el as HTMLButtonElement)"
            type="button"
            role="radio"
            class="pp-option"
            :class="{ 'is-active': p.name === palette }"
            :aria-checked="p.name === palette"
            :tabindex="p.name === palette ? 0 : -1"
            @click="choose(p.name)"
          >
            <span class="pp-swatch" :style="{ background: pie(p.swatch) }" aria-hidden="true" />
            <span class="pp-name">{{ p.label }}</span>
          </button>
        </div>

        <p class="pp-origin">
          {{ current.label }} · {{ current.origin }} · every pairing WCAG AA in light and dark
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pp {
  position: relative;
}

.pp-trigger {
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0 0.625rem 0 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.pp-trigger:active {
  transform: scale(var(--press-scale));
}

.pp-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.pp-dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 12%, transparent);
}

.pp-caret {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-ink-soft);
  transition: transform var(--duration-base) var(--ease-standard);
}

.pp-caret.is-open {
  transform: rotate(180deg);
}

@media (max-width: 40rem) {
  .pp-trigger-label {
    display: none;
  }
}

.pp-panel {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 0.625rem);
  z-index: 70;
  width: min(22rem, calc(100vw - 2rem));
  border-radius: var(--radius-card);
  padding: 1rem;
}

.pp-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.pp-grid {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem 0.25rem;
}

.pp-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-cell);
  padding: 0.25rem 0;
}

.pp-option:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.pp-swatch {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  box-shadow:
    inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 10%, transparent),
    0 0 0 0 var(--color-primary);
  transition:
    transform var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.pp-option:hover .pp-swatch {
  transform: scale(1.08) rotate(20deg);
}

/* The chosen one wears a ring in the palette's own primary, which is now the
   page's primary too — the ring and the page agree by construction. */
.pp-option.is-active .pp-swatch {
  box-shadow:
    inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 10%, transparent),
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-primary);
}

.pp-name {
  font-size: 0.6875rem;
  color: var(--color-ink-soft);
  white-space: nowrap;
}

.pp-option.is-active .pp-name {
  color: var(--color-ink);
  font-weight: 600;
}

.pp-origin {
  margin-top: 0.875rem;
  border-top: 1px solid var(--surface-border-color);
  padding-top: 0.625rem;
  font-size: 0.6875rem;
  color: var(--color-ink-soft);
}

.pp-pop-enter-active,
.pp-pop-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-standard);
  transform-origin: top right;
}

.pp-pop-enter-from,
.pp-pop-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(-4px);
}
</style>
