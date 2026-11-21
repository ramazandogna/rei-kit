<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'

import {
  CopyButton,
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  useMaterial,
  usePalette,
} from '../src/index'
import type { Material } from '../src/index'
import { HeroBackdrop } from '../src/motion/index'
import { COMPONENT_COUNT } from './site'
import PrismCard from './PrismCard.vue'
import { reduceMotion, seam } from './seam'
import './prism.css'

/**
 * "Change one attribute." The Prism: one card cut into four strips, each in a
 * different material. Plays once per session from CSS alone, then rests.
 * Seams drag (pointer and keyboard); a strip or label switches the site.
 */
const material = useMaterial()
const palette = usePalette()

const KEY = 'rei-prism-played'
function played() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const rest = ref(reduceMotion() || played())
onMounted(() => {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // Replay is a convenience.
  }
})

const stage = useTemplateRef<HTMLElement>('stage')
const pos = ref([25, 50, 75])
const dragging = ref(0)
const vertical = ref(false)
const GAP = 8

function syncOrientation() {
  vertical.value = typeof matchMedia === 'function' && matchMedia('(max-width: 39.99rem)').matches
}
syncOrientation()
/* Registered in onMounted and removed on unmount: added at setup, every
   visit to `/` left one more listener on the media query list. */
const narrow = typeof matchMedia === 'function' ? matchMedia('(max-width: 39.99rem)') : undefined

function setSeam(i: number, value: number) {
  const lo = i === 0 ? GAP : pos.value[i - 1]! + GAP
  const hi = i === 2 ? 100 - GAP : pos.value[i + 1]! - GAP
  const next = [...pos.value]
  next[i] = Math.min(hi, Math.max(lo, value))
  pos.value = next
  paint()
}
function paint() {
  const el = stage.value
  if (!el) return
  pos.value.forEach((p, i) => el.style.setProperty(`--s${i + 1}`, `${p}%`))
  const labels = el.parentElement?.querySelector<HTMLElement>('.prism-labels')
  pos.value.forEach((p, i) => labels?.style.setProperty(`--s${i + 1}`, `${p}%`))
}

function pct(event: PointerEvent | MouseEvent) {
  const r = stage.value!.getBoundingClientRect()
  return vertical.value
    ? ((event.clientY - r.top) / r.height) * 100
    : ((event.clientX - r.left) / r.width) * 100
}

/* The tour: once the intro has played, the seams glide on their own so each
   material takes the stage in turn — no dragging needed, which is what a
   phone needs, since a vertical drag there is the page scrolling. It has a
   pause button (WCAG 2.2.2), stops for good the moment the reader takes a
   seam, and never starts under reduced motion. */
const TOUR = [
  [58, 72, 86],
  [14, 72, 86],
  [14, 28, 86],
  [14, 28, 42],
  [25, 50, 75],
]
const playing = ref(false)
let tourStep = 0
let tourTimer: ReturnType<typeof setInterval> | undefined
let tourStart: ReturnType<typeof setTimeout> | undefined
/* Off screen, the tour would keep repainting four clipped layers nobody sees. */
let onScreen = true
let seen: IntersectionObserver | undefined
function tourTick() {
  if (!onScreen || (typeof document !== 'undefined' && document.hidden)) return
  const el = stage.value
  if (!el) return
  el.classList.add('is-auto')
  pos.value = [...TOUR[tourStep % TOUR.length]!]
  tourStep++
  paint()
}
function play() {
  if (tourTimer) return
  playing.value = true
  tourTick()
  tourTimer = setInterval(tourTick, 2600)
}
function pause() {
  playing.value = false
  if (tourTimer) clearInterval(tourTimer)
  tourTimer = undefined
}
function toggleTour() {
  if (playing.value) pause()
  else play()
}
function takeOver() {
  if (tourStart) clearTimeout(tourStart)
  pause()
  stage.value?.classList.remove('is-auto')
}
onMounted(() => {
  narrow?.addEventListener('change', syncOrientation)
  if (reduceMotion()) return
  if (typeof IntersectionObserver === 'function' && stage.value) {
    seen = new IntersectionObserver(([entry]) => (onScreen = entry?.isIntersecting ?? true))
    seen.observe(stage.value)
  }
  tourStart = setTimeout(play, rest.value ? 900 : 3200)
})
onBeforeUnmount(() => {
  narrow?.removeEventListener('change', syncOrientation)
  seen?.disconnect()
  if (tourStart) clearTimeout(tourStart)
  pause()
})

function down(i: number, event: PointerEvent) {
  /* A finger on a phone is scrolling the page, not grabbing a seam. */
  if (event.pointerType === 'touch') return
  event.preventDefault()
  takeOver()
  dragging.value = i + 1
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function move(i: number, event: PointerEvent) {
  if (dragging.value === i + 1) setSeam(i, pct(event))
}
function up() {
  dragging.value = 0
}
function key(i: number, event: KeyboardEvent) {
  const along = vertical.value ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  const k = event.key
  let next: number | undefined
  const step = event.shiftKey ? 10 : 2
  if (k === along[0]) next = pos.value[i]! - step
  else if (k === along[1]) next = pos.value[i]! + step
  else if (k === 'Home') next = -100
  else if (k === 'End') next = 200
  if (next === undefined) return
  event.preventDefault()
  takeOver()
  setSeam(i, next)
}
function reset() {
  const el = stage.value
  if (!el) return
  el.classList.add('is-reset')
  pos.value = [25, 50, 75]
  paint()
  setTimeout(() => el.classList.remove('is-reset'), 400)
}

function pick(m: Material, origin?: { x: number; y: number }) {
  seam(() => {
    material.value = m
    applyMaterial(m)
  }, origin)
}
function pickLabel(m: Material, event: MouseEvent) {
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const origin =
    event.detail === 0
      ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      : { x: event.clientX, y: event.clientY }
  pick(m, origin)
}
function clickStage(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.prism-seam')) return
  const p = pct(event)
  const i = p < pos.value[0]! ? 0 : p < pos.value[1]! ? 1 : p < pos.value[2]! ? 2 : 3
  pick(MATERIALS[i]!, { x: event.clientX, y: event.clientY })
}

const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`
function setPalette(name: string) {
  seam(() => {
    palette.value = name
    applyPalette(name)
  })
}
function ringKey(event: KeyboardEvent) {
  const d =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0
  if (!d) return
  event.preventDefault()
  const i = PALETTES.findIndex((p) => p.name === palette.value)
  const next = PALETTES[(i + d + PALETTES.length) % PALETTES.length]!
  setPalette(next.name)
  requestAnimationFrame(() =>
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus(),
  )
}

const SEAMS = [
  ['quiet', 'glass'],
  ['glass', 'brutal'],
  ['brutal', 'soft'],
] as const
const count = computed(() => COMPONENT_COUNT)
</script>

<template>
  <section class="prism site-page" :class="{ 'prism--rest': rest }" aria-labelledby="hero-title">
    <HeroBackdrop variant="aurora" fade="radial" :animate="false" class="prism-bg" />

    <div class="prism-copy">
      <p class="prism-eyebrow">data-material="{{ material }}"</p>
      <h1 id="hero-title" class="prism-title">
        Change one attribute.<span>Every surface follows.</span>
      </h1>
      <p class="prism-sub">
        {{ count }} accessible Vue 3 components for Tailwind CSS 4. Four materials (quiet, glass,
        brutal, soft), ten WCAG-checked palettes, light and dark, all from the same markup.
      </p>
      <div class="prism-actions">
        <div class="prism-install surface">
          <span>pnpm add rei-kit</span>
          <CopyButton
            text="pnpm add rei-kit"
            copy-label="Copy install command"
            copied-label="Copied"
            error-label="Could not copy"
          />
        </div>
        <RouterLink to="/components" class="prism-link focus-ring">Browse components →</RouterLink>
      </div>
      <p class="prism-hint">Tap a strip to wear it · ⌘K to search</p>
    </div>

    <div class="prism-wrap">
      <figure ref="stage" class="prism-stage" @click="clickStage">
        <figcaption class="sr-only">
          The same card shown in four materials: quiet, glass, brutal and soft.
        </figcaption>
        <div
          v-for="(m, i) in MATERIALS"
          :key="m"
          class="prism-layer"
          :data-material="m"
          :data-i="i"
          inert
          aria-hidden="true"
        >
          <PrismCard />
        </div>
        <span
          v-for="(pair, i) in SEAMS"
          :key="i"
          class="prism-seam"
          :class="{ 'is-drag': dragging === i + 1 }"
          :data-n="i + 1"
          role="separator"
          tabindex="0"
          :aria-orientation="vertical ? 'horizontal' : 'vertical'"
          :aria-label="`Seam between ${pair[0]} and ${pair[1]}`"
          aria-valuemin="8"
          aria-valuemax="92"
          :aria-valuenow="Math.round(pos[i]!)"
          @pointerdown="down(i, $event)"
          @pointermove="move(i, $event)"
          @pointerup="up"
          @pointercancel="up"
          @keydown="key(i, $event)"
          @dblclick="reset"
        />
      </figure>

      <button
        type="button"
        class="prism-play focus-ring"
        :aria-pressed="!playing"
        :aria-label="playing ? 'Pause the tour' : 'Play the tour'"
        @click="toggleTour"
      >
        <span aria-hidden="true">{{ playing ? '❚❚' : '▶' }}</span>
        <span>{{ playing ? 'Pause' : 'Play' }}</span>
      </button>

      <div class="prism-labels" role="group" aria-label="Use a material on this site">
        <button
          v-for="m in MATERIALS"
          :key="m"
          type="button"
          :data-material-pick="m"
          :aria-pressed="material === m"
          @click="pickLabel(m, $event)"
        >
          {{ m }}
        </button>
      </div>

      <div class="prism-ring" role="radiogroup" aria-label="Palette" @keydown="ringKey">
        <button
          v-for="p in PALETTES"
          :key="p.name"
          type="button"
          role="radio"
          :aria-checked="p.name === palette"
          :aria-label="p.label"
          :title="p.label"
          :tabindex="p.name === palette ? 0 : -1"
          :style="{ background: pie(p.swatch) }"
          @click="setPalette(p.name)"
        />
      </div>
    </div>
  </section>
</template>
