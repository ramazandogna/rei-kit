<script setup lang="ts">
import { ref } from 'vue'
import { PasswordInput } from 'rei-kit'

const password = ref('')
</script>

<template>
  <PasswordInput
    v-model="password"
    label="Password"
    toggle-label="Show password"
    hint="At least 12 characters."
    autocomplete="new-password"
  />
</template>
