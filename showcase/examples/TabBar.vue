<script setup lang="ts">
import { ref } from 'vue'
import { House, Settings } from 'lucide-vue-next'
import { TabBar } from 'rei-kit'

const active = ref('home')
const tabs = [
  { key: 'home', to: '/', label: 'Home', icon: House },
  { key: 'settings', to: '/settings', label: 'Settings', icon: Settings },
]
</script>

<template>
  <TabBar :items="tabs" :active="active" label="Main" />
</template>
