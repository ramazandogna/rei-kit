<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { ToastHost } from '../src/index'
import AppearanceDock from './AppearanceDock.vue'
import SiteFooter from './SiteFooter.vue'
import SiteHeader from './SiteHeader.vue'
import { seamKey } from './seam'

/* The palette is a dialog that needs a keypress; fetched after the first paint. */
const CommandPalette = defineAsyncComponent(() => import('./CommandPalette.vue'))

const findOpen = ref(false)
const route = useRoute()

/* `/` opens the palette too, unless focus is already in something typeable. */
function onSlash(event: KeyboardEvent) {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
  const t = event.target as HTMLElement | null
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
  event.preventDefault()
  findOpen.value = true
}
onMounted(() => window.addEventListener('keydown', onSlash))
onBeforeUnmount(() => window.removeEventListener('keydown', onSlash))
</script>

<template>
  <!-- `canvas` rather than `bg-canvas`: the utility also carries the
       material's backdrop, which is what glass has to see through. -->
  <div class="canvas text-ink min-h-dvh">
    <SiteHeader @find="findOpen = true" />

    <main id="top" class="site-main" tabindex="-1">
      <RouterView :key="route.path.startsWith('/docs') ? 'docs' : route.fullPath" />
    </main>

    <SiteFooter />
    <AppearanceDock />
    <ToastHost close-label="Close" />
    <CommandPalette v-model="findOpen" />
    <span v-if="seamKey" :key="seamKey" class="seam-line" aria-hidden="true" />
  </div>
</template>
