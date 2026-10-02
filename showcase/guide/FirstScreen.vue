<script setup lang="ts">
import {
  BaseButton,
  BaseInput,
  ErrorSummary,
  PageContainer,
  PageHeader,
  PasswordInput,
  ToastHost,
  useToast,
} from 'rei-kit'
import { ref } from 'vue'

/**
 * The screen the tenth minute should end on.
 *
 * Step five of "get started" proves a component works. This proves a screen
 * works, and it is a form on purpose: a form is the most common screen and
 * the place this kit earns the most, because the part that is laborious by
 * hand — a generated id, a label pointing at it, the hint and the error
 * sharing `aria-describedby`, and a summary that takes focus when the
 * submission is rejected — is the part that gets dropped when it is written
 * by hand, and nothing on screen says it was.
 *
 * It is a real component rather than a string in the page, type-checked with
 * the rest of the showcase, and the code shown beside it is this file. A
 * guide sample that has drifted from something that compiles is the one kind
 * of documentation worse than none.
 */
const LABELS: Record<string, string> = { email: 'Email', password: 'Password' }
const fieldId = (field: string) => `signup-${field}`

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string>>({})
const toast = useToast()

function submit() {
  const found: Record<string, string> = {}
  if (!email.value.includes('@')) found['email'] = 'Enter a valid email address'
  if (password.value.length < 12) found['password'] = 'Use at least 12 characters'

  errors.value = found
  if (!Object.keys(found).length) toast.success('Account created')
}
</script>

<template>
  <main class="canvas min-h-dvh py-8">
    <PageContainer>
      <PageHeader title="Create an account" />

      <form class="mt-6 flex flex-col gap-4" novalidate @submit.prevent="submit">
        <!-- Takes focus itself the first time the form is rejected, so a
             reader is not left on a button that appeared to do nothing. -->
        <ErrorSummary
          :errors="errors"
          title="There are fields to fix"
          :label-for="(field) => LABELS[field] ?? field"
          :field-id="fieldId"
          :fields="['email', 'password']"
        />

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
          hint="At least 12 characters."
          autocomplete="new-password"
          :error="errors['password']"
          :field-id="fieldId('password')"
        />

        <BaseButton type="submit" class="self-start">Create account</BaseButton>
      </form>
    </PageContainer>

    <ToastHost close-label="Close" />
  </main>
</template>
