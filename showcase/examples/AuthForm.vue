<script setup lang="ts">
import { ref } from 'vue'
import { AuthForm } from 'rei-kit/app'
import type { AuthFormValues } from 'rei-kit/app'
import { createAccount, signInWithGoogle } from './auth'

const remember = ref(true)
const busy = ref(false)
const labels = {
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm password',
  submit: 'Create account',
  google: 'Continue with Google',
  or: 'or',
  rememberMe: 'Remember me',
}

async function signUp({ email, password }: AuthFormValues) {
  busy.value = true
  await createAccount(email, password)
  busy.value = false
}
</script>

<template>
  <AuthForm
    v-model:remember="remember"
    mode="signUp"
    :labels="labels"
    :busy="busy"
    @submit="signUp"
    @google="signInWithGoogle"
  />
</template>
