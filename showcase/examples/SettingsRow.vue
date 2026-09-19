<script setup lang="ts">
import { Languages } from 'lucide-vue-next'
import { SettingsGroup, SettingsRow } from 'rei-kit'

function openLanguages() {
  // …
}
</script>

<template>
  <SettingsGroup title="Account">
    <SettingsRow
      label="Language"
      description="English"
      :icon="Languages"
      interactive
      @click="openLanguages"
    />
  </SettingsGroup>
</template>
