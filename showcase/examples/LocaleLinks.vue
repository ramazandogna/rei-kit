<script setup lang="ts">
import { ref } from 'vue'
import { LocaleLinks } from 'rei-kit'

const locale = ref('system')
</script>

<template>
  <LocaleLinks v-model="locale" :locales="['en', 'tr']" :labels="{ en: 'English', tr: 'Türkçe' }" />
</template>
