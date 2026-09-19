<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from 'rei-kit'

const deleting = ref(false)

function save() {
  // …
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <BaseButton @click="save">Save</BaseButton>
    <BaseButton variant="secondary">Cancel</BaseButton>
    <BaseButton variant="danger" :loading="deleting">Delete</BaseButton>
    <BaseButton as="a" href="/docs" variant="ghost">Read the docs</BaseButton>
  </div>
</template>
