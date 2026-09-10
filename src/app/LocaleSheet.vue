<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Languages } from 'lucide-vue-next'

import BaseButton from '../components/BaseButton.vue'
import BaseSheet from '../components/BaseSheet.vue'
import SettingsRow from '../components/SettingsRow.vue'

/**
 * Choosing the interface language, from a settings row.
 *
 * A sheet rather than a segmented control: past four options a row of pills
 * stops being readable, and the list of languages only grows.
 *
 * Both phone apps had this, 96% identical. What differed was one colour class.
 *
 * The labels are the caller's, and they should be **endonyms** — a language is
 * always listed in its own language, so someone who cannot read the current
 * interface can still find theirs. The kit cannot know them.
 */
const {
  label,
  hint = '',
  systemLabel,
  options,
  closeLabel = '',
} = defineProps<{
  /** The settings row's label, and the sheet's title. */
  label: string
  hint?: string | undefined
  /** What "follow the device" is called. Its value is `system`. */
  systemLabel: string
  /** In the order they should be listed. Labels are endonyms. */
  options: readonly { value: string; label: string }[]
  closeLabel?: string | undefined
}>()

const model = defineModel<string>({ required: true })

const open = ref(false)

const rows = computed(() => [{ value: 'system', label: systemLabel }, ...options])

const current = computed(
  () => rows.value.find((row) => row.value === model.value)?.label ?? systemLabel,
)

function select(value: string) {
  model.value = value
  open.value = false
}
</script>

<template>
  <SettingsRow
    :label="label"
    :description="hint"
    :icon="Languages"
    interactive
    @click="open = true"
  >
    <span class="text-ink-soft text-sm">{{ current }}</span>
  </SettingsRow>

  <BaseSheet v-model="open" :title="label" :subtitle="hint" :close-label="closeLabel">
    <ul class="flex flex-col">
      <li v-for="row in rows" :key="row.value">
        <BaseButton
          variant="row"
          class="rounded-xl"
          :pressed="model === row.value"
          @click="select(row.value)"
        >
          <span class="flex-1 text-base">{{ row.label }}</span>
          <Check
            v-if="model === row.value"
            class="text-primary size-5 shrink-0"
            aria-hidden="true"
          />
        </BaseButton>
      </li>
    </ul>
  </BaseSheet>
</template>
