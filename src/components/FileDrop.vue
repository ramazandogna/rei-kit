<script setup lang="ts">
import { Paperclip, Upload, X } from 'lucide-vue-next'
import { computed, ref, useId } from 'vue'

/**
 * Files, dropped on or chosen from a real file input.
 *
 * The input is the control; the box around it is a label. That is not a
 * detail: a `<div>` with a click handler cannot be reached with Tab, opened
 * with Enter, or announced as "choose file", and dragging is a pointer
 * gesture that a keyboard has no version of. Everything here works without a
 * drag.
 *
 * It holds files, not uploads. Sending them, the progress and the failures
 * are the app's — the kit does not know your endpoint, and a component that
 * guessed it would be wrong everywhere.
 */
const {
  label,
  hint = '',
  browseLabel,
  removeLabel,
  accept = undefined,
  multiple = false,
  maxSize = undefined,
  tooLargeLabel = undefined,
  disabled = false,
} = defineProps<{
  /** The instruction in the box: "Drop a receipt here". Already translated. */
  label: string
  /** A line under it: what is accepted, how big. */
  hint?: string | undefined
  /** The button inside the box, e.g. "Browse". */
  browseLabel: string
  /** Accessible name of each file's remove button. */
  removeLabel: string
  /** Passed to the input: `image/*`, `.pdf`. */
  accept?: string | undefined
  multiple?: boolean | undefined
  /** In bytes. Anything larger is refused and reported through `rejected`. */
  maxSize?: number | undefined
  /** Shown under the box when a file was too large. */
  tooLargeLabel?: string | undefined
  disabled?: boolean | undefined
}>()

const emit = defineEmits<{
  /** Files that were too large, so the app can say more than the kit can. */
  rejected: [files: File[]]
}>()

/** The files held, with `v-model`. */
const model = defineModel<File[]>({ default: () => [] })

const id = useId()
const over = ref(false)
const refused = ref(false)

const tooBig = (file: File) => maxSize !== undefined && file.size > maxSize

function take(list: FileList | null) {
  if (!list || disabled) return

  const incoming = Array.from(list)
  const rejected = incoming.filter(tooBig)
  const accepted = incoming.filter((file) => !tooBig(file))

  refused.value = rejected.length > 0
  if (rejected.length) emit('rejected', rejected)

  model.value = multiple ? [...model.value, ...accepted] : accepted.slice(0, 1)
}

function onDrop(event: DragEvent) {
  over.value = false
  take(event.dataTransfer?.files ?? null)
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  take(input.files)
  // Cleared, so choosing the same file twice in a row still fires.
  input.value = ''
}

function remove(index: number) {
  model.value = model.value.filter((_, at) => at !== index)
}

/** KB and MB by hand: `Intl` has no file sizes, and the unit is not a word. */
const size = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

const count = computed(() => model.value.length)
</script>

<template>
  <div class="rk-drop">
    <label
      class="rk-drop-box control"
      :class="{ 'is-over': over, 'is-disabled': disabled }"
      :for="id"
      @dragover.prevent="over = !disabled"
      @dragleave="over = false"
      @drop.prevent="onDrop"
    >
      <input
        :id="id"
        type="file"
        class="sr-only"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="onInput"
      />
      <Upload class="text-ink-soft size-6" aria-hidden="true" />
      <span class="rk-drop-label">{{ label }}</span>
      <span v-if="hint" class="rk-drop-hint">{{ hint }}</span>
      <span class="rk-drop-browse">{{ browseLabel }}</span>
    </label>

    <p v-if="refused && tooLargeLabel" class="rk-drop-error" role="alert">{{ tooLargeLabel }}</p>

    <ul v-if="count" class="rk-drop-files">
      <li
        v-for="(file, index) in model"
        :key="`${file.name}-${index}`"
        class="rk-drop-file control"
      >
        <Paperclip class="text-ink-soft size-4 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ file.name }}</span>
        <span class="rk-drop-size">{{ size(file.size) }}</span>
        <button
          type="button"
          class="rk-drop-remove focus-ring"
          :aria-label="`${removeLabel}: ${file.name}`"
          :disabled="disabled"
          @click="remove(index)"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rk-drop-box {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-card);
  border-style: dashed;
  border-width: 2px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

/* The box is a label, so the ring belongs to the input it names. */
.rk-drop-box:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-drop-box.is-over {
  border-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 8%, transparent);
}

.rk-drop-box.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.rk-drop-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.rk-drop-hint {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.rk-drop-browse {
  margin-top: 0.25rem;
  border-radius: 9999px;
  background: var(--color-muted);
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
}

.rk-drop-error {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-negative);
}

.rk-drop-files {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.rk-drop-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-ink);
}

.rk-drop-size {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink-soft);
}

.rk-drop-remove {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  color: var(--color-ink-soft);
}

.rk-drop-remove:hover {
  background: var(--color-muted);
  color: var(--color-ink);
}
</style>
