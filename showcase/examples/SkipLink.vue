<script setup lang="ts">
import { SkipLink } from 'rei-kit/web'
</script>

<template>
  <!-- First in the tab order, and invisible until it has focus. Press Tab. -->
  <div>
    <SkipLink for="example-main" label="İçeriğe geç" />

    <nav class="mb-3 flex gap-3" aria-label="Sections">
      <a href="#a" class="text-ink-soft text-sm">Products</a>
      <a href="#b" class="text-ink-soft text-sm">Pricing</a>
      <a href="#c" class="text-ink-soft text-sm">Docs</a>
    </nav>

    <main id="example-main" class="text-ink text-sm">The content the link skips to.</main>
  </div>
</template>
