import { computed, ref } from 'vue'

import { isInstalled, needsIosInstall } from '../utils/platform'

/**
 * The event Chromium fires when it decides the app is installable.
 *
 * Not in lib.dom yet, and it is the only way to trigger the install sheet from
 * the app's own button rather than the browser's.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferred = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)

let listening = false

/**
 * Starts listening for the install event.
 *
 * **Call this from the app's entry file, not from a component.**
 * `beforeinstallprompt` fires once, early, and only once per page load — a
 * listener attached when a component mounts has usually already missed it.
 *
 * It is a function rather than module-scope side effects so the package can be
 * imported on a server: the phone apps this came from ran it at module scope
 * and the kit spent a release learning why that is not free.
 *
 * @example
 * ```ts
 * // main.ts
 * import { watchInstallability } from 'rei-kit/pwa'
 * watchInstallability()
 * ```
 */
export function watchInstallability(): void {
  if (listening || typeof window === 'undefined') return

  listening = true
  installed.value = isInstalled()

  window.addEventListener('beforeinstallprompt', (event) => {
    // Without this the browser shows its own bar, and then the app's card and
    // the browser's bar are both on screen saying the same thing.
    event.preventDefault()
    deferred.value = event as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferred.value = null
  })
}

/**
 * Adding the app to the Home Screen.
 *
 * Three states, because the platforms genuinely differ: Chromium hands over an
 * event that can be triggered from a button, Safari on iOS has no API at all
 * and needs the user walked through Share → Add to Home Screen, and everything
 * else can only be told that installing is possible.
 *
 * @example
 * ```ts
 * const install = useInstall()
 * if (install.canPrompt.value) await install.prompt()
 * ```
 */
export function useInstall() {
  async function prompt(): Promise<boolean> {
    const event = deferred.value
    if (!event) return false

    await event.prompt()
    const { outcome } = await event.userChoice

    // The event is single-use: Chromium refuses a second prompt() on it.
    deferred.value = null

    return outcome === 'accepted'
  }

  return {
    isInstalled: computed(() => installed.value),
    /** A button can open the real install sheet. */
    canPrompt: computed(() => !installed.value && deferred.value !== null),
    /** No API — the user has to be shown the Share menu. */
    needsManualSteps: computed(() => !installed.value && needsIosInstall()),
    prompt,
  }
}
