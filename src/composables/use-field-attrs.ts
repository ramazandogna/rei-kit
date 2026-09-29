import { computed, useAttrs } from 'vue'

/**
 * Splits a field's fallthrough attributes in two.
 *
 * The three text fields bind `$attrs` to their inner `<input>`, which is what
 * makes `placeholder`, `autocomplete` and `inputmode` reach the control rather
 * than pile up on a wrapper that cannot use them. `class` and `style` are the
 * exception, and they were going along with the rest: Vue puts them on a
 * component's root element, so `class="mt-4"` reads as "space this field" and
 * was landing on the box _inside_ it, under the label.
 */
export function useFieldAttrs() {
  const attrs = useAttrs()
  return {
    fieldClass: computed(() => attrs.class),
    fieldStyle: computed(() => attrs.style),
    controlAttrs: computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    }),
  }
}
