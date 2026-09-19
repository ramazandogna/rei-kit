import { computed, ref, watch } from 'vue'
import type { Ref, WritableComputedRef } from 'vue'

/**
 * A `v-model` that accepts `undefined` and emits only what a field produces.
 *
 * `defineModel` could not be typed both ways. Without a default it declares
 * that it may emit `undefined`, so under vue-tsc's strictTemplates a
 * `ref('')` cannot be bound to it. With a default it drops `undefined` from
 * what it accepts, so under `exactOptionalPropertyTypes` a form library's
 * `string | undefined` cannot be. Hibi binds exactly that, and 2.4.0 as first
 * written broke it — the consumer check caught it before the tag.
 *
 * So the prop and the event are declared by hand — the prop as
 * `T | undefined`, the event as `T` — and this is the rest of what
 * `defineModel` did: follow the prop, and keep a value of its own when
 * nothing is bound. Vue applies `.trim` and `.number` to the event itself, so
 * modifiers behave as they did.
 *
 * Internal: not exported from the package.
 */
export function useBoundValue<T>(
  read: () => T | undefined,
  write: (value: T) => void,
): WritableComputedRef<T | undefined> {
  const local = ref(read()) as Ref<T | undefined>

  watch(read, (next) => {
    local.value = next
  })

  return computed({
    get: () => local.value,
    set: (next) => {
      local.value = next
      write(next as T)
    },
  })
}
