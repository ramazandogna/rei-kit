<script setup lang="ts">
import { ref } from 'vue'
import { Bold, Italic, Underline } from 'lucide-vue-next'
import { ToggleGroup } from 'rei-kit'

const marks = ref<string[]>([])
const marksOptions = [
  { value: 'bold', label: 'Bold', icon: Bold, iconOnly: true },
  { value: 'italic', label: 'Italic', icon: Italic, iconOnly: true },
  { value: 'underline', label: 'Underline', icon: Underline, iconOnly: true },
]
</script>

<template>
  <ToggleGroup v-model="marks" mode="multiple" :options="marksOptions" label="Text style" />
</template>
