<script setup lang="ts">
import { ref } from 'vue'
import { PinInput } from 'rei-kit'

const code = ref('')

function verify(value: string) {
  // Send the code — it fires once, when the last box is filled.
  console.log(value)
}
</script>

<template>
  <PinInput
    v-model="code"
    label="Verification code"
    :cell-label="(n, total) => `Digit ${n} of ${total}`"
    @complete="verify"
  />
</template>
