/**
 * rei-kit/pwa — installing the app, and updating it.
 *
 * A separate entry because these reach for `beforeinstallprompt` and a service
 * worker: an app that is a website should not download them, and the main
 * barrel has to stay importable on a server.
 *
 * Both phone apps had all of this, 95–100% identical — the same three-way
 * platform check, the same week-long snooze, the same two cards. What differed
 * was a storage key and a colour.
 */
export { useInstall, watchInstallability } from './use-install'
export { useSnooze } from './use-snooze'

/**
 * The card that offers to install the app, and remembers being turned
 * down.
 */
export { default as InstallPrompt } from './InstallPrompt.vue'
/** The way back to installing after the card has been dismissed. */
export { default as InstallSettings } from './InstallSettings.vue'
/** The card that says a new version is waiting. */
export { default as UpdatePrompt } from './UpdatePrompt.vue'
