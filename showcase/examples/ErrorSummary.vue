<script setup lang="ts">
import { BaseButton, BaseInput, ErrorSummary, PasswordInput } from 'rei-kit'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string>>({})

const LABELS: Record<string, string> = { email: 'Email', password: 'Password' }
const fieldId = (field: string) => `signup-${field}`

function submit() {
  const found: Record<string, string> = {}
  if (!email.value.includes('@')) found['email'] = 'Enter a valid email address'
  if (password.value.length < 12) found['password'] = 'Use at least 12 characters'

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

    <!-- The same function on both sides: the summary builds the href from it
         and each field takes its id from it, so the link lands on the field. -->
    <BaseInput
      v-model="email"
      label="Email"
      type="email"
      autocomplete="email"
      :error="errors['email']"
      :field-id="fieldId('email')"
    />

    <PasswordInput
      v-model="password"
      label="Password"
      toggle-label="Show password"
      autocomplete="new-password"
      :error="errors['password']"
      :field-id="fieldId('password')"
    />

    <BaseButton type="submit" class="self-start">Sign up</BaseButton>
  </form>
</template>
