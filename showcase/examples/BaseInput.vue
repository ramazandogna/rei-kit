<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from 'rei-kit'

const email = ref('')
const weight = ref(0)
</script>

<template>
  <BaseInput v-model="email" label="Email" type="email" hint="We never share it." />

  <!-- A unit attached to the field. It is `aria-hidden` because the label
       already says what the number is; a mark that is the only place the
       unit appears belongs in the label instead. -->
  <BaseInput v-model="weight" label="Weight in kilograms" type="number">
    <template #suffix><span aria-hidden="true">kg</span></template>
  </BaseInput>
</template>
