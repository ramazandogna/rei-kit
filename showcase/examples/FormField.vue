<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from 'rei-kit'

const name = ref('')
const error = ref('')
</script>

<template>
  <FormField label="Username" hint="Letters and numbers only" :error="error">
    <template #default="{ id, describedBy, invalid }">
      <input
        :id="id"
        v-model="name"
        class="control rounded-card px-3 py-2"
        :aria-describedby="describedBy"
        :aria-invalid="invalid"
      />
    </template>
  </FormField>
</template>
