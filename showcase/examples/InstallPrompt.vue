<script setup lang="ts">
import { InstallPrompt } from 'rei-kit/pwa'
</script>

<template>
  <InstallPrompt
    storage-key="my-app-install"
    title="Install My app"
    body="Open it from your home screen, even offline."
    action="Install"
    later="Not now"
  />
</template>
