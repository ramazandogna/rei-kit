<script setup lang="ts">
import { BaseBreadcrumb } from 'rei-kit/web'
</script>

<template>
  <BaseBreadcrumb
    :items="[{ label: 'Docs', to: '/docs' }, { label: 'Install' }]"
    label="Breadcrumb"
  />
</template>
