<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * A label, a hint, an error, and the wiring between them.
 *
 * This was inside `BaseInput`, which is why the kit had one form control
 * instead of five. The hard part of a field is not the `<input>` — it is
 * generating an id, pointing the label at it, deciding whether the description
 * is the hint or the error, and telling assistive tech which one to read. That
 * is identical for a select, a textarea and an input, and every app that
 * needed one of the other two wrote the whole thing again.
 *
 * The control comes in through the slot and is handed what it needs to be
 * described. It is a slot rather than a prop so the field never has to know
 * what it is wrapping.
 *
 * @example
 * ```vue
 * <FormField :label="t('profile.name')" :error="errors.name">
 *   <template #default="{ id, describedBy, invalid }">
 *     <input :id="id" :aria-describedby="describedBy" :aria-invalid="invalid" />
 *   </template>
 * </FormField>
 * ```
 */
const {
  label,
  error = '',
  hint = '',
  labelHidden = false,
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  /**
   * Hides the label visually but keeps it for assistive tech. For fields whose
   * surrounding row already names them — dropping the label entirely would
   * leave the control with no accessible name at all.
   */
  labelHidden?: boolean | undefined
}>()

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

/* One description at a time, and the error wins. Announcing the hint as well
   buries the reason the field was rejected under advice the reader has already
   had. */
const describedBy = computed(() => {
  if (error) return errorId
  if (hint) return hintId
  return undefined
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-ink text-sm font-medium" :class="labelHidden ? 'sr-only' : ''">
      {{ label }}
    </label>

    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />

    <p v-if="error" :id="errorId" class="text-negative text-xs">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-ink-soft text-xs">{{ hint }}</p>
  </div>
</template>
