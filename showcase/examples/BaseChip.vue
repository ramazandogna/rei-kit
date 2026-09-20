<script setup lang="ts">
import { ref } from 'vue'
import { BaseChip } from 'rei-kit'

const tags = ref(['design', 'vue'])

function remove(tag: string) {
  tags.value = tags.value.filter((one) => one !== tag)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <BaseChip
      v-for="tag in tags"
      :key="tag"
      :label="tag"
      :remove-label="`Remove ${tag}`"
      @remove="remove(tag)"
    />
  </div>
</template>
