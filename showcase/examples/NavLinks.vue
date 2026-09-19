<script setup lang="ts">
import { ref } from 'vue'
import { NavLinks } from 'rei-kit/web'

const active = ref('docs')
const links = [
  { key: 'docs', to: '/docs', label: 'Docs' },
  { key: 'blog', to: '/blog', label: 'Blog' },
]
</script>

<template>
  <NavLinks :items="links" :active="active" label="Main" />
</template>
