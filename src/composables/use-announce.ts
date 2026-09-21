import { nextTick, readonly, ref } from 'vue'

/**
 * Saying something to a screen reader when nothing on screen has changed
 * enough to say it.
 *
 * The kit already has a live region in a dozen places — `ToastHost`,
 * `BaseSpinner`, `OfflineBanner`, `CopyButton` — but every one of them
 * belongs to a component that happens to be on screen. What has no home is
 * everything else: a filter that narrows a list to three results, a route
 * that changed under a client-side navigation, a draft that saved itself.
 * On screen all of those are obvious. To a reader they are silence.
 *
 * ── Three things this gets right that a hand-written region does not ──
 *
 * **The region exists before the text does.** A live region inserted into
 * the page together with its first message is usually not announced at
 * all: the reader has nothing to notice a change *to*. So `AnnounceHost`
 * renders both regions empty, from mount, and only the text inside them
 * ever changes. This is the single most common reason a hand-rolled
 * announcement does nothing, and it fails silently on every platform.
 *
 * **The same sentence twice is still said twice.** "3 results" after
 * "3 results" is not a mutation, so a reader says nothing — and the reader
 * has no idea the filter did anything. The text is cleared and set again
 * on the next tick, which is a change either way.
 *
 * **Polite by default.** `assertive` interrupts whatever is being read,
 * mid-word. That is right for "connection lost" and rude for "saved", and
 * a region that is always assertive trains the reader to resent it.
 *
 * ── What is deliberately not here ──
 *
 * **No text of its own.** Like everything else in the kit, the sentence is
 * the app's.
 *
 * **Not for anything on screen.** If there is a visible message, it should
 * be the live region — `BaseAlert`, `FormField`, a toast. This is only for
 * what a sighted reader learns from the screen itself.
 *
 * **A singleton, on purpose.** Two hosts would be two regions, and a
 * message would be read twice.
 *
 * @example
 * ```ts
 * const { announce } = useAnnounce()
 * watch(results, (rows) => announce(t('search.found', { count: rows.length })))
 * ```
 */
export interface AnnounceOptions {
  /**
   * Interrupt whatever is being read. For something the reader has to know
   * now — a connection lost, a session about to expire — and nothing else.
   */
  assertive?: boolean | undefined
}

const polite = ref('')
const assertive = ref('')

/** Long enough to be read, short enough that a reader landing in the region
 *  later does not find a sentence about something that has since changed. */
const CLEAR_AFTER_MS = 7000

let timer: ReturnType<typeof setTimeout> | undefined

/**
 * Says something once. Render one `AnnounceHost` in the app for it to reach a
 * reader at all.
 */
export function announce(message: string, { assertive: urgent = false }: AnnounceOptions = {}) {
  const target = urgent ? assertive : polite

  if (timer !== undefined) clearTimeout(timer)

  /* Cleared first, then set on the next tick. Setting the same string again
     is not a change, and a reader announces changes — so without this, the
     second "3 results" is silence. */
  polite.value = ''
  assertive.value = ''

  void nextTick(() => {
    target.value = message

    timer = setTimeout(() => {
      target.value = ''
      timer = undefined
    }, CLEAR_AFTER_MS)
  })
}

export function useAnnounce() {
  return {
    announce,
    /** What the regions are saying. `AnnounceHost` renders these; apps read them in tests. */
    polite: readonly(polite),
    assertive: readonly(assertive),
  }
}
