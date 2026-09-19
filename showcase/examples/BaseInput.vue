<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from 'rei-kit'

const email = ref('')
</script>

<template>
  <BaseInput v-model="email" label="Email" type="email" hint="We never share it." />
</template>
