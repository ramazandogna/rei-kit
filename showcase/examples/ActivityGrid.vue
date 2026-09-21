<script setup lang="ts">
import { ActivityGrid, lastNDays, useToast } from 'rei-kit'

const toast = useToast()
const days = lastNDays(365)

/** Four steps, so a busy day reads differently from a quiet one. */
const LEVELS = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']

const count = (key: string) => (key.charCodeAt(9) + key.charCodeAt(8)) % 5

const levelFor = (key: string) => LEVELS[count(key)]!
const dayLabel = (key: string) => `${key}: ${count(key)} entries`
const isSelectable = (key: string) => count(key) > 0
</script>

<template>
  <ActivityGrid
    :days="days"
    label="Your year"
    :level-for="levelFor"
    :day-label="dayLabel"
    :is-selectable="isSelectable"
    @select="toast.info($event)"
  />
</template>
