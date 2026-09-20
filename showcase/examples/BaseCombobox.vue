<script setup lang="ts">
import { ref } from 'vue'
import { BaseCombobox } from 'rei-kit'

const country = ref('')
const countries = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
]

/* More than one answer: the chosen ones become chips in the field. */
const recipients = ref<string[]>(['tr'])

/* A list that lives on a server. `@search` is the typed text, debounced by
   the component; `filter="none"` stops it narrowing what the server already
   narrowed. */
const results = ref<{ value: string; label: string }[]>([])
const loading = ref(false)

async function search(query: string) {
  if (query === '') {
    results.value = []
    return
  }

  loading.value = true
  const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`)
  results.value = await response.json()
  loading.value = false
}
</script>

<template>
  <BaseCombobox
    v-model="country"
    label="Country"
    :options="countries"
    placeholder="Start typing"
    empty-label="No country matches"
  />

  <BaseCombobox
    v-model="recipients"
    mode="multiple"
    label="Recipients"
    :options="countries"
    :remove-label="(name) => `Remove ${name}`"
    placeholder="Add someone"
    empty-label="Nobody matches"
  />

  <BaseCombobox
    label="City"
    :options="results"
    :loading="loading"
    loading-label="Searching…"
    filter="none"
    placeholder="Type at least two letters"
    empty-label="No city matches"
    @search="search"
  />
</template>
