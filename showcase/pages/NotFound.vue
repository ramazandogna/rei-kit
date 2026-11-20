<script setup lang="ts">
import { BaseButton, EmptyState } from '../../src/index'
</script>

<template>
  <div class="site-page site-section">
    <EmptyState title="Nothing lives here" description="That address is not a page or a component.">
      <template #action>
        <BaseButton as="router-link" to="/components">Browse components</BaseButton>
      </template>
    </EmptyState>
  </div>
</template>
