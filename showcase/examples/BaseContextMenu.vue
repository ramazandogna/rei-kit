<script setup lang="ts">
import { useToast } from 'rei-kit'
import { BaseContextMenu } from 'rei-kit/web'

const toast = useToast()
</script>

<template>
  <BaseContextMenu label="Row actions">
    <template #default="{ props }">
      <!-- A button, because `aria-expanded` belongs to a role that takes
           it. A div with `tabindex` is reachable, not announced. -->
      <button
        type="button"
        class="border-hair rounded-card focus-ring w-full border border-dashed p-6 text-sm"
        v-bind="props"
      >
        Right-click this area — or focus it and press Shift+F10.
      </button>
    </template>

    <template #items="{ close }">
      <button type="button" role="menuitem" @click="(toast.success('Renamed'), close())">
        Rename
      </button>
      <button type="button" role="menuitem" @click="(toast.info('Duplicated'), close())">
        Duplicate
      </button>
      <hr />
      <button type="button" role="menuitem" @click="(toast.danger('Deleted'), close())">
        Delete
      </button>
    </template>
  </BaseContextMenu>
</template>
