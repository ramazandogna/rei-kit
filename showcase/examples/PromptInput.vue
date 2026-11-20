<script setup lang="ts">
import { ref } from 'vue'
import { PromptInput } from 'rei-kit'

const text = ref('')
const sent = ref<string[]>([])
</script>

<template>
  <div class="grid gap-3">
    <PromptInput
      v-model="text"
      label="Message"
      placeholder="Ask anything…"
      hint="Shift+Enter adds a line."
      @submit="sent.push($event)"
    />
    <p class="text-ink-soft text-sm">Sent: {{ sent.length }}</p>
  </div>
</template>
