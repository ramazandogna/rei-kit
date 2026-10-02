<script setup lang="ts">
import { BaseButton, ErrorSummary, FormField } from 'rei-kit'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string>>({})

const LABELS: Record<string, string> = { email: 'Email', password: 'Password' }
const fieldId = (field: string) => `signup-${field}`

function submit() {
  const found: Record<string, string> = {}
  if (!email.value.includes('@')) found['email'] = 'Enter a valid email address'
  if (password.value.length < 8) found['password'] = 'Use at least 8 characters'

  errors.value = found
}
</script>

<template>
  <form class="flex flex-col gap-3" novalidate @submit.prevent="submit">
    <!-- Takes focus itself the first time the form is rejected, so the
         reader is not left on a button that appeared to do nothing. -->
    <ErrorSummary
      :errors="errors"
      title="There are fields to fix"
      :label-for="(field) => LABELS[field] ?? field"
      :field-id="fieldId"
      :fields="['email', 'password']"
    />

    <FormField label="Email" :error="errors['email']" :field-id="fieldId('email')">
      <template #default="{ id, describedBy, invalid }">
        <input
          :id="id"
          v-model="email"
          type="email"
          class="control rounded-card px-3 py-2"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </template>
    </FormField>

    <FormField label="Password" :error="errors['password']" :field-id="fieldId('password')">
      <template #default="{ id, describedBy, invalid }">
        <input
          :id="id"
          v-model="password"
          type="password"
          class="control rounded-card px-3 py-2"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </template>
    </FormField>

    <BaseButton type="submit" class="self-start">Sign up</BaseButton>
  </form>
</template>
