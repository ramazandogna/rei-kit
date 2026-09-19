<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox } from 'rei-kit'

const remember = ref(false)
</script>

<template>
  <BaseCheckbox v-model="remember" label="Remember me" />
</template>
