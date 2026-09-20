<script setup lang="ts">
import { ref } from 'vue'
import { BaseTree } from 'rei-kit/web'
import type { TreeNode } from 'rei-kit/web'

const nodes: TreeNode<string>[] = [
  {
    key: 'src',
    label: 'src',
    children: [
      { key: 'index', label: 'index.ts' },
      {
        key: 'components',
        label: 'components',
        children: [{ key: 'button', label: 'Button.vue' }],
      },
    ],
  },
  { key: 'readme', label: 'README.md' },
]

const open = ref(['src'])
const chosen = ref<string | undefined>('index')
</script>

<template>
  <BaseTree v-model="chosen" v-model:expanded="open" :nodes="nodes" label="Files" />
</template>
