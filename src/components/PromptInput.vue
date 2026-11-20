<script setup lang="ts">
import { ArrowUp, Square } from 'lucide-vue-next'
import { computed, nextTick, onMounted, useId, useTemplateRef, watch } from 'vue'

import BaseButton from './BaseButton.vue'

/**
 * The box a message is typed into: a textarea that grows with its content up
 * to `maxRows`, with Send (or Stop while the assistant is replying).
 *
 * Enter sends and Shift+Enter adds a line — except while an input method is
 * composing, when Enter belongs to the composition. Empty or whitespace-only
 * text cannot be sent. After `submit` the field is cleared; the v-model stays
 * authoritative, so a parent that wants to keep the text can set it back.
 *
 * The label is tied to the field (and hidden by default); `hint` and the
 * keyboard hint are read after it.
 *
 * @example
 * ```vue
 * <PromptInput v-model="text" label="Message" @submit="send" />
 * ```
 */
const {
  label,
  labelHidden = true,
  placeholder = undefined,
  busy = false,
  disabled = false,
  maxRows = 8,
  maxLength = undefined,
  submitLabel = 'Send',
  stopLabel = 'Stop',
  hint = undefined,
  keyHint = 'Enter to send, Shift+Enter for a new line',
} = defineProps<{
  label: string
  labelHidden?: boolean | undefined
  placeholder?: string | undefined
  /** A reply is in progress: Send becomes Stop. */
  busy?: boolean | undefined
  disabled?: boolean | undefined
  maxRows?: number | undefined
  maxLength?: number | undefined
  submitLabel?: string | undefined
  stopLabel?: string | undefined
  hint?: string | undefined
  /** Read to screen readers after the label. */
  keyHint?: string | undefined
}>()

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{ submit: [text: string]; stop: [] }>()

defineSlots<{
  /** Before the field: attach buttons. */
  leading?: () => unknown
  /** Before Send. */
  actions?: () => unknown
}>()

const id = useId()
const area = useTemplateRef<HTMLTextAreaElement>('area')
const empty = computed(() => model.value.trim() === '')

function fit() {
  const el = area.value
  if (!el) return
  el.style.height = 'auto'
  const line = parseFloat(getComputedStyle(el).lineHeight) || 24
  el.style.height = `${Math.min(el.scrollHeight, line * maxRows)}px`
}

onMounted(fit)
watch(model, () => void nextTick(fit))

function send() {
  if (disabled || busy || empty.value) return
  emit('submit', model.value.trim())
  model.value = ''
}

function keydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}
</script>

<template>
  <div class="pi">
    <label :for="`${id}-f`" :class="labelHidden ? 'sr-only' : 'pi-label'">{{ label }}</label>
    <div class="pi-box control rounded-card">
      <div v-if="$slots.leading" class="pi-side"><slot name="leading" /></div>
      <textarea
        :id="`${id}-f`"
        ref="area"
        v-model="model"
        class="pi-area"
        rows="1"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :aria-describedby="`${id}-k${hint ? ` ${id}-h` : ''}`"
        @keydown="keydown"
        @input="fit"
      />
      <div class="pi-side">
        <slot name="actions" />
        <BaseButton
          v-if="busy"
          icon
          size="sm"
          variant="secondary"
          :aria-label="stopLabel"
          @click="emit('stop')"
        >
          <Square class="size-4" aria-hidden="true" />
        </BaseButton>
        <BaseButton
          v-else
          icon
          size="sm"
          variant="primary"
          :aria-label="submitLabel"
          :disabled="disabled || empty"
          @click="send"
        >
          <ArrowUp class="size-4" aria-hidden="true" />
        </BaseButton>
      </div>
    </div>
    <p v-if="hint" :id="`${id}-h`" class="pi-hint">{{ hint }}</p>
    <p :id="`${id}-k`" class="sr-only">{{ keyHint }}</p>
  </div>
</template>

<style scoped>
.pi-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.pi-box {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem;
}
.pi-box:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.pi-area {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.25rem 0.25rem;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  line-height: 1.5;
}
.pi-area::placeholder {
  color: var(--color-ink-soft);
}

.pi-side {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.pi-hint {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}
</style>
