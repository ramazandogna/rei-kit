<script setup lang="ts">
import { AnnounceHost, BaseButton, useAnnounce } from 'rei-kit'
import { ref } from 'vue'

const { announce } = useAnnounce()
const count = ref(0)

function filter() {
  count.value = (count.value + 3) % 12
  // Nothing on screen changed enough to say this, so it is said.
  announce(`${count.value} sonuç`)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Rendered once per app. Nothing here is ever visible. -->
    <AnnounceHost />

    <BaseButton variant="secondary" @click="filter">Filtrele</BaseButton>
    <span class="text-ink-soft text-sm">{{ count }} sonuç</span>
  </div>
</template>
