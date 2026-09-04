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
 * Does the environment prefer a dark scheme?
 *
 * `matchMedia` is checked for on its own rather than inferred from `document`.
 * Having one does not imply having the other: jsdom supplies a document and no
 * `matchMedia`, so a consumer's component test that so much as mounts something
 * calling `useTheme` threw — and some embedded webviews are the same. Where
 * there is nothing to ask, the answer is no rather than an exception.
 */
function prefersDarkScheme(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
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

  const isDark = preference === 'dark' || (preference === 'system' && prefersDarkScheme())

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

  // While on `system`, follow the OS if the user flips it at night. Only where
  // there is something to listen to; see `prefersDarkScheme`.
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
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
