<script setup lang="ts">
import { ref } from 'vue'
import { Home, Mail, Settings } from 'lucide-vue-next'
import { Dock } from 'rei-kit/web'

const active = ref('home')
const items = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'mail', label: 'Mail', icon: Mail, badge: 3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]
</script>

<template>
  <Dock label="Apps" :items="items" :active="active" @select="active = $event" />
</template>
