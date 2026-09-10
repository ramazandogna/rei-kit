import { watch } from 'vue'
import type { Ref } from 'vue'

import { isThemePreference, useTheme } from '../composables/use-theme'

/**
 * Adopts the theme stored on the account, once, as soon as it arrives.
 *
 * Two things make this worth a component rather than four lines at a call
 * site, and both are about *once*.
 *
 * It has to run at the app root rather than on the settings screen, or a user
 * on a fresh device keeps the system theme until they happen to open Profile.
 * And it has to run once and never again, or a later refetch of the profile
 * undoes a choice the user has just made locally — the theme flips back under
 * them a second after they set it, which reads as the app fighting them.
 *
 * The source is a ref rather than a query, so the kit never learns what a
 * profile is or where it came from.
 *
 * @example
 * ```ts
 * const { data: profile } = useProfile()
 * useThemeSync(computed(() => profile.value?.theme))
 * ```
 */
export function useThemeSync(stored: Ref<string | null | undefined>): void {
  const theme = useTheme()

  let adopted = false

  watch(
    stored,
    (next) => {
      if (adopted || next === null || next === undefined) return

      adopted = true

      if (isThemePreference(next) && next !== theme.value) {
        theme.value = next
      }
    },
    { immediate: true },
  )
}
