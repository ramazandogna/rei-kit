<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseStepper } from 'rei-kit'

const steps = [
  { key: 'account', label: 'Account' },
  { key: 'plan', label: 'Plan' },
  { key: 'payment', label: 'Payment' },
] as const
const step = ref<(typeof steps)[number]['key']>('plan')
</script>

<template>
  <BaseStepper
    v-model="step"
    :steps="steps"
    label="Sign-up"
    interactive
    :state-labels="{ complete: 'done', error: 'needs attention' }"
  />
  <BaseButton class="mt-4" @click="step = 'payment'">Next</BaseButton>
</template>
