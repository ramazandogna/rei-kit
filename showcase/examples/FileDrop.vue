<script setup lang="ts">
import { ref } from 'vue'
import { FileDrop } from 'rei-kit'

const files = ref<File[]>([])
</script>

<template>
  <FileDrop
    v-model="files"
    label="Drop a receipt here"
    hint="PDF or an image, up to 5 MB"
    browse-label="Browse"
    remove-label="Remove"
    too-large-label="That file is over 5 MB"
    accept="image/*,.pdf"
    :max-size="5 * 1024 * 1024"
    multiple
  />
</template>
