<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'

import { focusTarget } from '../utils/focus-target'

/**
 * What a rejected form says at the top of itself.
 *
 * ## Why a summary and not just the messages beside the fields
 *
 * `FormField` already puts the reason beside the field it belongs to, and
 * that is where it has to stay — it is where the reader's eye is and where
 * it stays until the field is fixed. What that does not do is tell anyone
 * the submission failed at all. On a long form the first rejected field
 * can be a screenful above or below, focus is still on the submit button,
 * and to a screen reader nothing happened when it was pressed.
 *
 * So this is not a second copy of the messages. It is the answer to "did
 * that work?", and a way to get from there to each field in one press.
 *
 * ## It is focused, not announced
 *
 * The obvious build gives this `role="alert"`, and then a reader hears the
 * whole list read at it while focus stays on the button it cannot use. The
 * standard answer is better: move focus *into* the summary. Its heading
 * and list are read because the reader is now there, the links are one Tab
 * away rather than a search, and Escape is not needed because nothing was
 * taken over.
 *
 * Focus moves on its own the first time errors appear. It does not move
 * again on its own, because a form that re-validates as you type would
 * otherwise drag focus out of the field being corrected on every
 * keystroke. Call `focus()` from the submit handler for the second and
 * third attempts — the exposed method exists for exactly that.
 *
 * ## The order is the form's, not the object's
 *
 * Errors are read in the order the keys arrive, which is the order the
 * schema lists them, which is usually the order the fields are in. When it
 * is not, `fields` names the order explicitly — a list that reads bottom to
 * top sends the reader up and down the form instead of through it.
 */
const {
  errors,
  title,
  labelFor,
  fieldId = (field: string) => field,
  fields = undefined,
} = defineProps<{
  /** Field name to message, as `fieldErrors` returns it. */
  errors: Readonly<Record<string, string>>
  /** Heads the summary, e.g. "Düzeltilmesi gereken 2 alan var". Already translated. */
  title: string
  /** A field's name as the reader knows it. The kit has no words of its own. */
  labelFor: (field: string) => string
  /**
   * A field's `id`, to link to. Pass the same one to that `FormField`'s
   * `fieldId`, or the link points at nothing and the reader is left at the
   * top of a form they cannot navigate.
   */
  fieldId?: ((field: string) => string) | undefined
  /** The order to read them in, when the object's own order is not the form's. */
  fields?: readonly string[] | undefined
}>()

const panel = useTemplateRef<HTMLElement>('panel')

const listed = computed(() => {
  const names = fields ?? Object.keys(errors)

  return names
    .filter((field) => errors[field] !== undefined)
    .map((field) => ({ field, message: errors[field]!, id: fieldId(field) }))
})

const hasErrors = computed(() => listed.value.length > 0)

/** Moves focus into the summary. Call it on every failed submit. */
function focus() {
  focusTarget(panel.value)
}

/* The fragment is left on the link so it still works without JavaScript,
   but a fragment alone scrolls without moving focus — the reader arrives
   at the field visually and is still up here for everything else. */
function goToField(event: MouseEvent, id: string) {
  if (focusTarget(id)) event.preventDefault()
}

/*
 * Once, on the way from valid to not.
 *
 * The watched value is *whether* there are errors, not which — so a form
 * that re-validates while the reader types cannot fire this, and focus
 * stays in the field being corrected. Watching the messages instead would
 * pull focus out of it on every keystroke, which is worse than never
 * focusing at all.
 */
watch(hasErrors, async (now) => {
  if (!now) return

  // The panel does not exist until this change has rendered.
  await nextTick()
  focus()
})

defineExpose({ focus })
</script>

<template>
  <div v-if="hasErrors" ref="panel" class="rk-errsum" tabindex="-1">
    <p class="rk-errsum-title">{{ title }}</p>

    <ul class="rk-errsum-list">
      <li v-for="item in listed" :key="item.field">
        <a :href="`#${item.id}`" class="rk-errsum-link" @click="goToField($event, item.id)">
          {{ labelFor(item.field) }}: {{ item.message }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rk-errsum {
  border: 2px solid var(--color-negative);
  border-radius: var(--radius-card);
  padding: 0.875rem 1rem;
}

.rk-errsum:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-errsum-title {
  margin: 0;
  color: var(--color-negative);
  font-size: 0.875rem;
  font-weight: 600;
}

.rk-errsum-list {
  margin: 0.5rem 0 0;
  padding-inline-start: 1.125rem;
  color: var(--color-negative);
  font-size: 0.8125rem;
}

.rk-errsum-list li + li {
  margin-block-start: 0.25rem;
}

.rk-errsum-link {
  color: inherit;
  text-decoration: underline;
}

.rk-errsum-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
