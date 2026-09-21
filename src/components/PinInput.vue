<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { horizontalStep } from '../utils/direction'

/**
 * A short code typed one character per box — a sign-in code, a PIN.
 *
 * No `maxlength` on the boxes: iOS fills a one-time code into the first box
 * in one go, and a limit of one would cut it to its first digit.
 *
 * The boxes are a way of showing the length, not of splitting the work:
 * typing moves to the next box on its own, Backspace on an empty box goes
 * back and clears, the arrows move, and pasting "482913" anywhere fills all
 * six. The first box carries `autocomplete="one-time-code"`, so a phone
 * offers the code from the message it just received.
 *
 * `complete` fires once when the last box is filled — the moment to submit,
 * so nobody has to find a button after typing six digits.
 */
const {
  length = 6,
  label,
  cellLabel,
  type = 'numeric',
  mask = false,
  error = '',
  disabled = false,
} = defineProps<{
  /** How many characters. */
  length?: number | undefined
  /** The group's accessible name, e.g. "Verification code". */
  label: string
  /** Each box's accessible name, from its 1-based position: `(n, total) => \`Digit ${n} of ${total}\``. */
  cellLabel: (position: number, total: number) => string
  /** `numeric` takes digits and opens the number pad; `alphanumeric` takes letters too. */
  type?: 'numeric' | 'alphanumeric' | undefined
  /** Show dots instead of the characters, for a PIN. */
  mask?: boolean | undefined
  /** A message under the boxes; also marks them invalid. */
  error?: string | undefined
  disabled?: boolean | undefined
}>()

const emit = defineEmits<{ complete: [code: string] }>()

/** The code so far, with `v-model`. Always shorter than or as long as `length`. */
const model = defineModel<string>({ default: '' })

const cells = ref<HTMLInputElement[]>([])
const errorId = useId()

const allowed = computed(() => (type === 'numeric' ? /[0-9]/ : /[0-9a-z]/i))
const chars = computed(() => Array.from({ length }, (_, i) => model.value[i] ?? ''))

function clean(text: string) {
  return Array.from(text)
    .filter((char) => allowed.value.test(char))
    .join('')
}

function write(next: string) {
  const code = next.slice(0, length)
  const wasComplete = model.value.length === length
  model.value = code
  if (code.length === length && !wasComplete) emit('complete', code)
}

function focusCell(index: number) {
  const cell = cells.value[Math.max(0, Math.min(length - 1, index))]
  cell?.focus()
  cell?.select()
}

function onInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const typed = clean(input.value)

  // More than one character arrived: autofill or a paste the browser routed
  // through input. Either way it is the code, from this box on.
  if (typed.length > 1) {
    write(model.value.slice(0, index) + typed)
    focusCell(index + typed.length)
    return
  }

  input.value = typed
  if (!typed) return

  // The code has no gaps: a character typed into a box past the end lands at
  // the end, and focus follows it.
  const at = Math.min(index, model.value.length)
  write(model.value.slice(0, at) + typed + model.value.slice(at + 1))
  focusCell(at + 1)
}

function onPaste(event: ClipboardEvent, index: number) {
  const text = clean(event.clipboardData?.getData('text') ?? '')
  if (!text) return

  event.preventDefault()
  write(model.value.slice(0, index) + text)
  focusCell(index + text.length)
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    event.preventDefault()
    const target = chars.value[index] ? index : index - 1
    if (target < 0) return
    write(model.value.slice(0, target) + model.value.slice(target + 1))
    focusCell(target)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    /* The boxes are laid out the way the language runs, so in Arabic the
       box to the left of this one is the next digit. */
    focusCell(index + horizontalStep(event.key, event.currentTarget as Element))
  }
}
</script>

<template>
  <div class="rk-pin">
    <div class="rk-pin-cells" role="group" :aria-label="label">
      <input
        v-for="(char, index) in chars"
        :key="index"
        ref="cells"
        class="rk-pin-cell control focus-ring"
        :class="{ 'is-invalid': error }"
        :value="char"
        :type="mask ? 'password' : 'text'"
        :inputmode="type === 'numeric' ? 'numeric' : 'text'"
        :autocomplete="index === 0 ? 'one-time-code' : 'off'"
        :aria-label="cellLabel(index + 1, length)"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? errorId : undefined"
        :disabled="disabled"
        @input="onInput($event, index)"
        @paste="onPaste($event, index)"
        @keydown="onKeydown($event, index)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>
    <p v-if="error" :id="errorId" class="rk-pin-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.rk-pin-cells {
  display: flex;
  gap: 0.5rem;
}

.rk-pin-cell {
  width: 2.75rem;
  height: 3.25rem;
  border-radius: var(--radius-card);
  text-align: center;
  font-size: 1.375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  caret-color: var(--color-primary);
}

.rk-pin-cell.is-invalid {
  --surface-border-color: var(--color-negative);
}

.rk-pin-cell:disabled {
  opacity: 0.5;
}

.rk-pin-error {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-negative);
}
</style>
