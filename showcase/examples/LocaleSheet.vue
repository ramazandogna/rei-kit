<script setup lang="ts">
import { ref } from 'vue'
import { LocaleSheet } from 'rei-kit/app'

const locale = ref('system')
</script>

<template>
  <LocaleSheet
    v-model="locale"
    label="Language"
    system-label="Same as device"
    :options="[
      { value: 'en', label: 'English' },
      { value: 'tr', label: 'Türkçe' },
    ]"
    close-label="Close"
  />
</template>
