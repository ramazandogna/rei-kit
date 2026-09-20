<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Settings } from 'lucide-vue-next'
import { BaseButton } from 'rei-kit'
import { CommandMenu } from 'rei-kit/web'
import type { CommandGroup } from 'rei-kit/web'

const open = ref(false)

const groups: CommandGroup<'new' | 'settings'>[] = [
  {
    label: 'Entries',
    items: [{ id: 'new', label: 'Write an entry', hint: '⌘N', icon: FileText, keywords: ['add'] }],
  },
  { label: 'App', items: [{ id: 'settings', label: 'Open settings', icon: Settings }] },
]

function run(id: 'new' | 'settings') {
  console.log(id)
}
</script>

<template>
  <BaseButton variant="secondary" @click="open = true">Commands (⌘K)</BaseButton>

  <CommandMenu
    v-model="open"
    :groups="groups"
    label="Commands"
    placeholder="Type a command or search"
    empty-label="Nothing found"
    hotkey="k"
    @select="run"
  />
</template>
