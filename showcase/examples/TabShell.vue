<script setup lang="ts">
import { RouterView } from 'vue-router'
import { TabShell } from 'rei-kit/app'
</script>

<template>
  <TabShell>
    <RouterView />

    <template #aside>
      <p>© 2026 My app</p>
    </template>
  </TabShell>
</template>
