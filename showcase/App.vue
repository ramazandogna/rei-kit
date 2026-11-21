<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { ToastHost } from '../src/index'
import SiteHeader from './SiteHeader.vue'
import { seamKey } from './seam'

/* The palette carries the whole catalogue (the props of 120 components), so
   it is neither imported nor mounted until somebody asks for it: ⌘K, `/` or
   the header button. On a fast connection the chunk is fetched when the
   main thread is idle, so the first open does not wait on the network. */
/* Neither is part of the first screen: the footer is below the fold and the
   dock is a floating control. Their own chunks keep the entry small. */
const SiteFooter = defineAsyncComponent(() => import('./SiteFooter.vue'))
const AppearanceDock = defineAsyncComponent(() => import('./AppearanceDock.vue'))

const loadPalette = () => import('./CommandPalette.vue')
const CommandPalette = defineAsyncComponent(loadPalette)

const findOpen = ref(false)
const paletteMounted = ref(false)
const route = useRoute()

function openFind() {
  paletteMounted.value = true
  findOpen.value = true
}

/* `/` opens the palette too, unless focus is already in something typeable.
   ⌘K is the palette's own hotkey once it is mounted; until then, it is here. */
function onKey(event: KeyboardEvent) {
  const mod = event.metaKey || event.ctrlKey
  if (!paletteMounted.value && mod && !event.altKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openFind()
    return
  }
  if (event.key !== '/' || mod || event.altKey) return
  const t = event.target as HTMLElement | null
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
  event.preventDefault()
  openFind()
}

let idle = 0
onMounted(() => {
  window.addEventListener('keydown', onKey)
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection
  if (conn?.saveData || (conn?.effectiveType && conn.effectiveType !== '4g')) return
  const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000))
  idle = ric(() => void loadPalette().catch(() => undefined), { timeout: 5000 })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
  else window.clearTimeout(idle)
})
</script>

<template>
  <!-- `canvas` rather than `bg-canvas`: the utility also carries the
       material's backdrop, which is what glass has to see through. -->
  <div class="canvas text-ink min-h-dvh">
    <SiteHeader @find="openFind" />

    <main id="top" class="site-main" tabindex="-1">
      <RouterView :key="route.path.startsWith('/docs') ? 'docs' : route.fullPath" />
    </main>

    <SiteFooter />
    <AppearanceDock />
    <ToastHost close-label="Close" />
    <CommandPalette v-if="paletteMounted" v-model="findOpen" />
    <span v-if="seamKey" :key="seamKey" class="seam-line" aria-hidden="true" />
  </div>
</template>
