<script setup lang="ts">
import { CheckCircle2, Download, Share } from 'lucide-vue-next'

import BaseButton from '../components/BaseButton.vue'
import SettingsGroup from '../components/SettingsGroup.vue'
import SettingsRow from '../components/SettingsRow.vue'
import { useInstall } from './use-install'

/**
 * The way back to installing after the card has been dismissed.
 *
 * The card snoozes for a week; without this row, someone who tapped "Not now"
 * and then changed their mind would have nowhere to go. Both phone apps had it,
 * thirty-four lines, with no difference at all.
 *
 * It renders nothing where installing is neither possible nor already done — a
 * settings group that says "you cannot install this" is worse than silence.
 */
defineProps<{
  /** The group's heading. */
  title: string
  /** The row's label while installing is still possible. */
  label: string
  /** The row's label once it is installed. */
  installedLabel: string
  body: string
  /** Shown instead of `body` on iOS, where the user must use the Share menu. */
  iosBody: string
  /** The install button. Absent on iOS, which has no API to call. */
  action: string
}>()

const { isInstalled, canPrompt, needsManualSteps, prompt } = useInstall()
</script>

<template>
  <SettingsGroup v-if="isInstalled || canPrompt || needsManualSteps" :title="title">
    <SettingsRow
      :label="isInstalled ? installedLabel : label"
      :description="isInstalled ? '' : needsManualSteps ? iosBody : body"
      :icon="isInstalled ? CheckCircle2 : needsManualSteps ? Share : Download"
      stacked
    >
      <BaseButton v-if="canPrompt" variant="primary" size="sm" class="self-start" @click="prompt">
        {{ action }}
      </BaseButton>
    </SettingsRow>
  </SettingsGroup>
</template>
