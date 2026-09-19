<script setup lang="ts">
import { ref } from 'vue'
import { BaseSwitch, SettingsGroup, SettingsRow } from 'rei-kit'

const reminders = ref(true)
</script>

<template>
  <SettingsGroup title="Notifications">
    <SettingsRow label="Daily reminder">
      <BaseSwitch v-model="reminders" label="Daily reminder" label-hidden />
    </SettingsRow>
  </SettingsGroup>
</template>
