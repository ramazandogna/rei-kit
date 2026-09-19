<script setup lang="ts">
import { ref } from 'vue'
import { BaseDisclosure } from 'rei-kit/web'

const open = ref(false)
</script>

<template>
  <BaseDisclosure v-model="open" title="Show details">
    Everything that did not fit in the summary.
  </BaseDisclosure>
</template>
