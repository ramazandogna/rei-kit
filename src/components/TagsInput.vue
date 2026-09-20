<script setup lang="ts">
import { ref } from 'vue'

import BaseChip from './BaseChip.vue'
import FormField from './FormField.vue'

/**
 * A field that holds several short values: recipients, labels, skills.
 *
 * Enter and a comma commit what has been typed; Backspace on an empty field
 * takes the last one back, which is the shortcut everybody tries. The chips
 * are before the field rather than beside it, so the caret is always at the
 * end of the line the way it is in a mail client.
 *
 * A pasted "vue, html, css" becomes three tags rather than one: whatever is
 * pasted is split on commas and line breaks, which is the shape every list
 * copied from somewhere else arrives in.
 *
 * `removeLabel` builds each chip's remove button name from the tag, so a
 * screen reader hears "Remove: design" rather than five buttons called "×".
 */
const {
  label,
  removeLabel,
  placeholder = '',
  hint = '',
  error = '',
  max = undefined,
  allowDuplicates = false,
  size = 'md',
  labelHidden = false,
  disabled = false,
} = defineProps<{
  label: string
  /** `(tag) => \`Remove ${tag}\`` — already translated. */
  removeLabel: (tag: string) => string
  placeholder?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  /** How many tags at most. The field stops taking them at the limit. */
  max?: number | undefined
  /** By default the same tag twice is ignored. */
  allowDuplicates?: boolean | undefined
  size?: 'sm' | 'md' | undefined
  labelHidden?: boolean | undefined
  disabled?: boolean | undefined
}>()

/** The tags, with `v-model`. */
const model = defineModel<string[]>({ default: () => [] })

const draft = ref('')

/** Commits one or many: "vue, html" is two tags however it arrived. */
function commit(text: string) {
  const parts = text
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return

  const next = [...model.value]
  for (const value of parts) {
    if (max !== undefined && next.length >= max) break
    if (!allowDuplicates && next.includes(value)) continue
    next.push(value)
  }

  if (next.length !== model.value.length) model.value = next
}

function add() {
  const text = draft.value
  draft.value = ''
  commit(text)
}

function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') ?? ''
  // Only when there is something to split on; a single word is left to the
  // field so the caret stays where the reader put it.
  if (!/[\n,]/.test(text)) return

  event.preventDefault()
  commit(`${draft.value}${text}`)
  draft.value = ''
}

function remove(index: number) {
  model.value = model.value.filter((_, at) => at !== index)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    // Enter here commits a tag; it must not also submit the form around it.
    event.preventDefault()
    add()
    return
  }

  if (event.key === 'Backspace' && draft.value === '' && model.value.length) {
    event.preventDefault()
    remove(model.value.length - 1)
  }
}
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :size="size" :label-hidden="labelHidden">
    <template #default="{ id, describedBy, invalid }">
      <div
        class="rk-tags control"
        :class="{ 'is-invalid': invalid, 'is-disabled': disabled }"
        @click="!disabled && ($el as HTMLElement).querySelector('input')?.focus()"
      >
        <BaseChip
          v-for="(tag, index) in model"
          :key="`${tag}-${index}`"
          :label="tag"
          :remove-label="removeLabel(tag)"
          :disabled="disabled"
          @remove="remove(index)"
        />

        <input
          :id="id"
          v-model="draft"
          type="text"
          class="rk-tags-field"
          autocomplete="off"
          :placeholder="model.length ? '' : placeholder"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
          :disabled="disabled || (max !== undefined && model.length >= max)"
          @keydown="onKeydown"
          @paste="onPaste"
          @blur="add"
        />
      </div>
    </template>
  </FormField>
</template>

<style scoped>
.rk-tags {
  display: flex;
  min-height: 2.75rem;
  cursor: text;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-card);
  padding: 0.375rem 0.5rem;
}

/* `:has(input:focus-visible)` rather than `:focus-within`: the ring belongs
   to the field, not to the chips' remove buttons, which carry their own. */
.rk-tags:has(.rk-tags-field:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.rk-tags.is-invalid {
  --surface-border-color: var(--color-negative);
}

.rk-tags.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.rk-tags-field {
  min-width: 6rem;
  flex: 1;
  background: transparent;
  /* 16px, like every other field: below it iOS zooms the page in on focus
     and never zooms back. */
  font-size: 1rem;
  color: var(--color-ink);
  outline: none;
}
</style>
