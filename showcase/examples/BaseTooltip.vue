<script setup lang="ts">
import { BaseButton } from 'rei-kit'
import { BaseTooltip } from 'rei-kit/web'
</script>

<template>
  <BaseTooltip label="Copy link">
    <BaseButton icon variant="ghost" aria-label="Copy link">⧉</BaseButton>
  </BaseTooltip>

  <!--
    `follow` tracks the pointer, for a target big enough that a bubble pinned
    to the middle would be nowhere near what is under the cursor. It falls
    back to the anchored bubble for a keyboard and for anyone who asked their
    system for less motion.
  -->
  <BaseTooltip label="Tuesday, 12 September — 3 entries" follow>
    <div class="bg-muted rounded-card grid h-24 w-full place-items-center">A calendar cell</div>
  </BaseTooltip>
</template>
