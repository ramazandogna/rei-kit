<script setup lang="ts">
import { AuthForm, AuthShell } from 'rei-kit/app'
import type { AuthFormValues } from 'rei-kit/app'
import { signInWithPassword } from './auth'

const labels = {
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm password',
  submit: 'Sign in',
}

async function signIn({ email, password }: AuthFormValues) {
  await signInWithPassword(email, password)
}
</script>

<template>
  <AuthShell>
    <template #brand>My app</template>

    <AuthForm mode="signIn" :labels="labels" @submit="signIn" />
  </AuthShell>
</template>
