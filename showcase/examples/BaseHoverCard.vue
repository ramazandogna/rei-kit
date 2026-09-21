<script setup lang="ts">
import { BaseAvatar, BaseButton } from 'rei-kit'
import { BaseHoverCard } from 'rei-kit/web'
</script>

<template>
  <BaseHoverCard label="About Ramazan">
    <template #default="{ props }">
      <BaseButton variant="link" v-bind="props">@ramazandogna</BaseButton>
    </template>

    <template #card>
      <div class="flex gap-3">
        <BaseAvatar label="Ramazan Dogan" />
        <div>
          <p class="text-ink text-sm font-medium">Ramazan Dogan</p>
          <p class="text-ink-soft mt-1 text-xs leading-relaxed">
            Builds rei-kit and three apps on it.
          </p>
        </div>
      </div>
    </template>
  </BaseHoverCard>
</template>
