/**
 * Whether the app is running from the Home Screen rather than a browser tab.
 *
 * Two checks because iOS predates the standard one: `display-mode: standalone`
 * is the modern signal, `navigator.standalone` is Safari's own.
 */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** iPhone and iPad, including iPadOS reporting itself as a Mac. */
export function isApplePortable(): boolean {
  if (typeof window === 'undefined') return false

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * Whether this device can only receive notifications once the app is installed.
 *
 * Safari on iOS grants notification permission to an installed web app and to
 * nothing else — in a normal tab the request does not even prompt. Telling the
 * user to allow notifications there is asking for something the browser will
 * not offer, so the UI has to say "add to Home Screen" instead.
 *
 * @example
 * ```ts
 * if (needsIosInstall()) // show the Home Screen instruction, not the button
 * ```
 */
export function needsIosInstall(): boolean {
  return isApplePortable() && !isInstalled()
}
