import { computed, ref } from 'vue'

import { addDays, todayKey } from '../utils/date'

/**
 * A nudge that stops asking for a while after it is dismissed.
 *
 * Both phone apps had this inside their install card, identically: a date in
 * `localStorage`, compared against today. Pulled out because the install card
 * is not the only thing that should stop asking — a notification nudge wants
 * exactly the same behaviour, and had exactly the same code.
 *
 * Storage is wrapped in try/catch on both sides. A private window or a browser
 * set to block site data throws on access, and the honest failure there is a
 * nudge that reappears next session rather than one that crashes the screen it
 * is asking from.
 *
 * @param key - Where the date is kept. Namespace it to the app.
 * @param days - How long to stay quiet after a dismissal.
 */
export function useSnooze(key: string, days = 7) {
  const read = (): string => {
    try {
      return localStorage.getItem(key) ?? ''
    } catch {
      return ''
    }
  }

  const until = ref(read())

  return {
    /** False while the nudge is snoozed. */
    isOver: computed(() => todayKey() >= until.value),

    /** Stop asking for `days`. */
    snooze(): void {
      const next = addDays(todayKey(), days)
      until.value = next

      try {
        localStorage.setItem(key, next)
      } catch {
        // Storage blocked; it reappears next session rather than never.
      }
    },
  }
}
