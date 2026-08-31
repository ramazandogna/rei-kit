import { onScopeDispose } from 'vue'

/**
 * Delays a callback until the caller stops calling it.
 *
 * Used for note autosave: a request per keystroke would be wasteful, but losing
 * the last keystrokes when the user navigates away would be worse — so the
 * pending call is flushed on dispose, and `flush` is exposed for route guards.
 *
 * @param callback - Runs with the arguments of the most recent call.
 * @param delay - Quiet period in milliseconds.
 * @returns `run` to schedule, `flush` to run now, `cancel` to drop.
 *
 * @example
 * ```ts
 * const save = useDebouncedCallback((body: string) => mutate(body), 800)
 * watch(text, (value) => save.run(value))
 * onBeforeRouteLeave(() => save.flush())
 * ```
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 800,
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: A | null = null

  /** Runs the pending call right now, if there is one. */
  function flush() {
    if (timer !== null) clearTimeout(timer)
    timer = null

    if (pending !== null) {
      const args = pending
      pending = null
      callback(...args)
    }
  }

  /** Drops the pending call without running it. */
  function cancel() {
    if (timer !== null) clearTimeout(timer)
    timer = null
    pending = null
  }

  function run(...args: A) {
    pending = args
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(flush, delay)
  }

  // A closing sheet or an unmounting view must not eat the last keystrokes.
  onScopeDispose(flush)

  return { run, flush, cancel }
}
