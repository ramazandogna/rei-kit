<script setup lang="ts">
import { ref } from 'vue'
import { TagsInput } from 'rei-kit'

const tags = ref(['design'])
</script>

<template>
  <TagsInput
    v-model="tags"
    label="Tags"
    placeholder="Type and press Enter"
    :remove-label="(tag) => `Remove ${tag}`"
    :max="5"
  />
</template>
