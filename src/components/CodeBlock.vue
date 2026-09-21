<script setup lang="ts">
import { computed } from 'vue'

import CopyButton from './CopyButton.vue'

/**
 * A sample of code, as written.
 *
 * ## No highlighting, and no `v-html`
 *
 * A code sample is the one place where what is written is exactly what is
 * meant, so the text goes in as text. Highlighting would mean either a
 * parser in the bundle of every app that shows one line of shell, or
 * `v-html` and a promise the app cannot keep about where the string came
 * from. An app that wants colour can highlight on its own and put the
 * result in the default slot; the frame, the scrolling and the copying
 * stay here.
 *
 * ## The scroll is the accessibility problem
 *
 * A long line makes this scroll sideways, and a scrolling box that cannot
 * take focus cannot be scrolled by a keyboard at all — the end of the line
 * is simply unreachable, with nothing on screen to say so. So when it can
 * scroll it is focusable and named, which is also what makes a screen
 * reader announce it as a region rather than dropping the reader into loose
 * text.
 *
 * `wrap` is the other answer: no scrolling, no focus stop, and long lines
 * broken instead. Which one is right depends on the code — a shell command
 * wraps well, a table of output does not — so it is the app's to choose.
 */
const {
  code,
  label,
  language = undefined,
  wrap = false,
  copyLabel = undefined,
  copiedLabel = undefined,
} = defineProps<{
  /** The sample itself. Shown exactly as given. */
  code: string
  /**
   * Names the block, e.g. "Installing the package".
   *
   * Required because this is a region a reader can land in, and an unnamed
   * one is announced as nothing at all.
   */
  label: string
  /** Shown in the corner, e.g. `bash`, `ts`. Not used to highlight anything. */
  language?: string | undefined
  /** Break long lines instead of scrolling sideways. */
  wrap?: boolean | undefined
  /** Given together with `copiedLabel`, adds a copy button. Already translated. */
  copyLabel?: string | undefined
  copiedLabel?: string | undefined
}>()

defineSlots<{
  /** The body, when the app has highlighted it itself. Plain text otherwise. */
  default?: () => unknown
}>()

const copyable = computed(() => copyLabel !== undefined && copiedLabel !== undefined)

/*
 * Only a box that actually scrolls becomes a tab stop.
 *
 * A focus stop that scrolls nothing is a stop somebody has to Tab past for
 * no reason, and on a page of samples that is one per sample.
 */
const scrolls = computed(() => !wrap)
</script>

<template>
  <figure class="rk-code" :class="{ 'is-wrapped': wrap }">
    <figcaption v-if="language || copyable" class="rk-code-bar">
      <span v-if="language" class="rk-code-lang">{{ language }}</span>
      <CopyButton
        v-if="copyable"
        class="rk-code-copy"
        :text="code"
        :copy-label="copyLabel!"
        :copied-label="copiedLabel!"
      />
    </figcaption>

    <pre
      class="rk-code-pre"
      :tabindex="scrolls ? 0 : undefined"
      :role="scrolls ? 'region' : undefined"
      :aria-label="scrolls ? label : undefined"
    ><code><slot>{{ code }}</slot></code></pre>
  </figure>
</template>

<style scoped>
.rk-code {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-card);
  background: color-mix(in oklab, var(--color-muted) 50%, transparent);
}

.rk-code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem 0.375rem 1rem;
  border-block-end: 1px solid var(--color-hair);
  color: var(--color-ink-soft);
  font-size: 0.75rem;
}

.rk-code-lang {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* Pushes the button to the end when there is no language beside it. */
.rk-code-copy {
  margin-inline-start: auto;
}

.rk-code-pre {
  margin: 0;
  overflow-x: auto;
  padding: 1rem 1.25rem;
  color: var(--color-ink);
  font-size: 0.875rem;
  line-height: 1.75;
}

.rk-code-pre:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.is-wrapped .rk-code-pre {
  overflow-x: visible;
  white-space: pre-wrap;
  word-break: break-word;
}

.rk-code-pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
