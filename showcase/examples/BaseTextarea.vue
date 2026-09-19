<script setup lang="ts">
import { ref } from 'vue'
import { BaseTextarea } from 'rei-kit'

const note = ref('')
</script>

<template>
  <BaseTextarea v-model="note" label="Note" :rows="4" />
</template>
