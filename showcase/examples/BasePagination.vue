<script setup lang="ts">
import { ref } from 'vue'
import { BasePagination } from 'rei-kit/web'

const page = ref(1)
</script>

<template>
  <BasePagination
    :page="page"
    :pages="12"
    previous-label="Previous"
    next-label="Next"
    label="Pages"
    @change="page = $event"
  />
</template>
