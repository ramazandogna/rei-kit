<script setup lang="ts">
import { ref } from 'vue'
import { BaseSplitter } from 'rei-kit/web'

const split = ref(35)
</script>

<template>
  <BaseSplitter v-model="split" label="Resize the list" class="h-72">
    <template #start><nav class="p-3">The list</nav></template>
    <template #end><article class="p-3">What is selected</article></template>
  </BaseSplitter>
</template>
