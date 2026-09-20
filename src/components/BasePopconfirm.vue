<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BasePopover from './BasePopover.vue'
import type { PopoverTriggerProps } from './BasePopover.vue'

/**
 * "Are you sure?", asked beside the button that asked it.
 *
 * A modal for a one-word question takes the whole page away from what it is
 * about; this keeps the thing being deleted on screen and the question next
 * to it. Reach for `BaseModal` or `ResponsiveDialog` when the answer needs
 * explaining, and for a toast with an undo when it does not need asking at
 * all — an undo is kinder than a confirmation, and this component is the
 * middle of those two.
 *
 * The trigger is yours, as it is in `BasePopover`: bind `props` to whatever
 * you render.
 */
const {
  message,
  confirmLabel,
  cancelLabel,
  title = '',
  tone = 'danger',
} = defineProps<{
  /** The question. Already translated. */
  message: string
  /** The button that goes ahead, e.g. "Delete". */
  confirmLabel: string
  /** The button that does not, e.g. "Cancel". */
  cancelLabel: string
  /** A heading over the question, and the panel's accessible name. */
  title?: string | undefined
  /** The confirming button's variant. */
  tone?: 'danger' | 'primary' | undefined
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

defineSlots<{
  /** The control that asks. Bind `props` on it: `v-bind="props"`. */
  trigger: (props: { open: boolean; props: PopoverTriggerProps }) => unknown
}>()

/** Open or closed, with `v-model`. */
const open = defineModel<boolean>({ default: false })

function confirm(close: () => void) {
  close()
  emit('confirm')
}

function cancel(close: () => void) {
  close()
  emit('cancel')
}
</script>

<template>
  <BasePopover v-model="open" :label="title || message" align="end">
    <template #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <template #default="{ close }">
      <div class="rk-confirm">
        <p v-if="title" class="rk-confirm-title">{{ title }}</p>
        <p class="rk-confirm-message">{{ message }}</p>

        <div class="rk-confirm-actions">
          <BaseButton size="sm" variant="secondary" @click="cancel(close)">
            {{ cancelLabel }}
          </BaseButton>
          <BaseButton size="sm" :variant="tone" @click="confirm(close)">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BasePopover>
</template>

<style scoped>
.rk-confirm {
  max-width: 17rem;
}

.rk-confirm-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
}

.rk-confirm-message {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-ink-soft);
}

/* The confirming button last, where the eye and the thumb finish. */
.rk-confirm-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
