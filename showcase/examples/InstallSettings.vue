<script setup lang="ts">
import { InstallSettings } from 'rei-kit/pwa'
</script>

<template>
  <InstallSettings
    title="App"
    label="Install on this device"
    installed-label="Installed"
    body="Opens from your home screen, works offline."
    ios-body="Tap Share, then Add to Home Screen."
    action="Install"
  />
</template>
