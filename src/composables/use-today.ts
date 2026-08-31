import { readonly, ref } from 'vue'

import { todayKey } from '../utils/date'

/**
 * Today's date key, kept current while the app stays open.
 *
 * `todayKey()` called once in `setup` freezes the date for the lifetime of the
 * component. Nobody notices in a session that lasts minutes, but a phone left
 * on the Today screen overnight would keep marking yesterday, and the Week grid
 * would disable the column that just became today.
 */
const current = ref(todayKey())

let timer: ReturnType<typeof setTimeout> | undefined

/** A second past midnight, so a fast timer cannot fire on the old date. */
function msUntilMidnight(): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)

  return next.getTime() - now.getTime()
}

function refresh() {
  current.value = todayKey()
}

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    refresh()
    schedule()
  }, msUntilMidnight())
}

schedule()

// A sleeping phone does not run timers reliably, so the tab also re-checks the
// moment it comes back — which is when the user would see a stale date.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return

  refresh()
  schedule()
})

/**
 * @returns Read-only ref holding today's `YYYY-MM-DD` key.
 *
 * @example
 * ```ts
 * const today = useToday()
 * const isFuture = computed(() => day > today.value)
 * ```
 */
export function useToday() {
  return readonly(current)
}
