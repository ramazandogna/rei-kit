<script setup lang="ts">
import { CodeBlock } from 'rei-kit'

const INSTALL = `pnpm add rei-kit
# then, in src/assets/main.css
@import 'tailwindcss';
@import 'rei-kit/web.css';`
</script>

<template>
  <CodeBlock
    :code="INSTALL"
    label="Installing the package"
    language="bash"
    copy-label="Copy the snippet"
    copied-label="Copied"
  />
</template>
