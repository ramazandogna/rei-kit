<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker, PALETTES } from 'rei-kit'

const brand = ref('#6b4de6')

/* The swatches are yours, values and names — the kit ships no colours of its
   own. `PALETTES` is one ready source if you want the kit's ten. */
const swatches = PALETTES.map((palette) => ({
  value: palette.swatch[0],
  label: palette.name,
}))
</script>

<template>
  <ColorPicker
    v-model="brand"
    label="Brand colour"
    hex-label="Hex value"
    :swatches="swatches"
    hint="Used for buttons, links and the active state."
  />
</template>
