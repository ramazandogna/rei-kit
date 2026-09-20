<script setup lang="ts">
import { Bold, Italic, Underline } from 'lucide-vue-next'
import { BaseButton, BaseSeparator } from 'rei-kit'
import { BaseToolbar } from 'rei-kit/web'
</script>

<template>
  <BaseToolbar label="Formatting">
    <BaseButton icon variant="ghost" aria-label="Bold"><Bold class="size-4" /></BaseButton>
    <BaseButton icon variant="ghost" aria-label="Italic"><Italic class="size-4" /></BaseButton>
    <BaseSeparator orientation="vertical" spacing="sm" />
    <BaseButton icon variant="ghost" aria-label="Underline"
      ><Underline class="size-4"
    /></BaseButton>
  </BaseToolbar>
</template>
