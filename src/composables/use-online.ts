import { onMounted, onUnmounted, readonly, ref } from 'vue'

/**
 * Tracks whether the browser thinks it has a network connection.
 *
 * Note the limit: `navigator.onLine` only reports whether a network interface
 * is up, not whether requests actually succeed. Treat it as a hint for the UI,
 * never as a reason to skip error handling.
 *
 * Listeners are removed on unmount, so the composable is safe to call per view.
 *
 * @returns A readonly ref that flips with the browser's online/offline events.
 *
 * @example
 * ```ts
 * const isOnline = useOnline()
 * // <p v-if="!isOnline">You're offline.</p>
 * ```
 */
export function useOnline() {
  const isOnline = ref(true)

  function update() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return readonly(isOnline)
}
