import { ref, watch } from 'vue'
import type { Ref } from 'vue'

/** What the user asked for; `system` follows the OS. */
export type ThemePreference = 'system' | 'light' | 'dark'

/**
 * Namespaced by the app, not by this package.
 *
 * Two rei-kit apps served from the same origin would otherwise share one theme
 * setting — and during development on localhost, they will be.
 */
let storageKey = 'rei-theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

/** Reads the stored preference, falling back to `system`. */
export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(storageKey)

    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function storeTheme(preference: ThemePreference): void {
  try {
    localStorage.setItem(storageKey, preference)
  } catch {
    // Private mode or blocked storage: the choice just will not persist.
  }
}

/**
 * Adds or removes `.dark` on `<html>`, resolving `system` against the OS.
 *
 * A no-op without a document. There is no OS preference to read on a server and
 * no `<html>` to write to, so a prerender leaves the class off and the app
 * decides the theme before hydration — see the note in the README.
 */
export function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = preference === 'dark' || (preference === 'system' && prefersDark)

  document.documentElement.classList.toggle('dark', isDark)
}

/**
 * The shared preference, created on first use rather than at import.
 *
 * Lazy on purpose: reading storage at import time would lock in the default key
 * before an app had a chance to set its own, leaving the controller reading one
 * key and writing another.
 */
let preference: Ref<ThemePreference> | null = null

function controller(): Ref<ThemePreference> {
  if (preference) return preference

  preference = ref<ThemePreference>(readStoredTheme())

  watch(
    preference,
    (next) => {
      storeTheme(next)
      applyTheme(next)
    },
    { immediate: true },
  )

  // While on `system`, follow the OS if the user flips it at night.
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (preference?.value === 'system') applyTheme('system')
    })
  }

  return preference
}

/**
 * Sets where the preference is stored.
 *
 * Safe in either order: called before the first `useTheme()` it simply changes
 * the key, and called after it re-reads under the new one, so the controller
 * never reads from one key while writing to another.
 *
 * @example
 * ```ts
 * setThemeStorageKey('hibi-theme')   // once, at startup
 * ```
 */
export function setThemeStorageKey(key: string): void {
  storageKey = key
  if (preference) preference.value = readStoredTheme()
}

/** @returns The shared preference ref; assigning to it stores and applies it. */
export function useTheme(): Ref<ThemePreference> {
  return controller()
}
