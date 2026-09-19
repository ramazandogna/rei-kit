<script setup lang="ts">
import { ref } from 'vue'
import { UpdatePrompt } from 'rei-kit/pwa'

const needRefresh = ref(false)

function reload() {
  location.reload()
}
</script>

<template>
  <UpdatePrompt
    :open="needRefresh"
    title="A new version is ready"
    body="Reload to get it."
    action="Reload"
    dismiss-label="Later"
    @update="reload"
    @dismiss="needRefresh = false"
  />
</template>
