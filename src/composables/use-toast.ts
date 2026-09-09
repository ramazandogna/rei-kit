import { readonly, ref } from 'vue'

/**
 * Saying that something happened.
 *
 * The reason this exists is a measurement rather than a preference: the word
 * "toast" appeared **zero times** across all three consuming apps. Not because
 * they had decided against it — because there was no mechanism, so every save,
 * every delete and every export finished in silence and the only way to know
 * it had worked was that nothing had visibly broken.
 *
 * ── What is deliberately not here ──
 *
 * **No text.** The kit never knows a sentence. Callers pass the message; a
 * component that called a translator would force one on the app.
 *
 * **Not for form errors.** A field that was rejected says so beside itself,
 * where the reader's eye already is and where it stays until fixed. A toast
 * that disappears after four seconds is the wrong place for something the
 * reader has to act on. Use `BaseAlert` and `FormField` for those; use this
 * for what has already happened.
 *
 * **A singleton, on purpose.** Two hosts would mean two stacks racing for the
 * same corner. The store lives at module scope and `ToastHost` renders it.
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export interface Toast {
  readonly id: number
  readonly message: string
  readonly tone: ToastTone
  /** Milliseconds on screen. `0` stays until dismissed. */
  readonly duration: number
}

export interface ToastOptions {
  /** Milliseconds on screen; `0` stays until dismissed. */
  duration?: number | undefined
}

/**
 * Four seconds: long enough to read a short sentence twice, short enough that
 * a second action does not queue behind it.
 */
const DEFAULT_DURATION = 4000

/**
 * A failure is read more slowly than a confirmation, and more often twice.
 */
const DANGER_DURATION = 7000

/**
 * Three at once. A fourth pushes the oldest out rather than growing the stack
 * off the top of the screen — an action that produces ten toasts is a loop,
 * and a loop should not be able to cover the app it is running in.
 */
const MAX_VISIBLE = 3

const items = ref<Toast[]>([])

let nextId = 0

interface Countdown {
  handle: ReturnType<typeof setTimeout>
  remaining: number
  startedAt: number
}

const countdowns = new Map<number, Countdown>()

function clearCountdown(id: number): void {
  const countdown = countdowns.get(id)
  if (countdown === undefined) return

  clearTimeout(countdown.handle)
  countdowns.delete(id)
}

/** Removes a toast, whether it timed out or was dismissed. */
function dismiss(id: number): void {
  clearCountdown(id)
  items.value = items.value.filter((item) => item.id !== id)
}

/** Removes everything on screen. For a route change, or a sign-out. */
function dismissAll(): void {
  for (const id of countdowns.keys()) clearCountdown(id)
  items.value = []
}

function arm(id: number, remaining: number): void {
  // A timer is a browser thing. On a server there is nothing to time and
  // nothing to see, and arming one would keep the process alive past the last
  // page — which is how a prerender build hangs instead of finishing.
  if (typeof window === 'undefined' || remaining <= 0) return

  countdowns.set(id, {
    handle: setTimeout(() => dismiss(id), remaining),
    remaining,
    startedAt: Date.now(),
  })
}

/**
 * Stops the clock on a toast the reader is pointing at.
 *
 * Somebody who has moved the pointer onto it is reading it, and taking it away
 * mid-sentence is the one thing a notification must not do.
 */
function pause(id: number): void {
  const countdown = countdowns.get(id)
  if (countdown === undefined) return

  clearTimeout(countdown.handle)
  countdowns.set(id, {
    ...countdown,
    remaining: Math.max(0, countdown.remaining - (Date.now() - countdown.startedAt)),
  })
}

/** Starts it again, from where it stopped rather than from the beginning. */
function resume(id: number): void {
  const countdown = countdowns.get(id)
  if (countdown === undefined) return

  arm(id, countdown.remaining)
}

function push(tone: ToastTone, message: string, options: ToastOptions = {}): number {
  const id = ++nextId
  const duration = options.duration ?? (tone === 'danger' ? DANGER_DURATION : DEFAULT_DURATION)

  const next = [...items.value, { id, message, tone, duration }]

  while (next.length > MAX_VISIBLE) {
    const oldest = next.shift()
    if (oldest !== undefined) clearCountdown(oldest.id)
  }

  items.value = next
  arm(id, duration)

  return id
}

/**
 * The stack, and the four ways to add to it.
 *
 * @example
 * ```ts
 * const toast = useToast()
 *
 * toast.success(t('habit.saved'))
 * toast.danger(t('common.failed'), { duration: 0 })  // stays until dismissed
 *
 * const id = toast.info(t('export.preparing'), { duration: 0 })
 * toast.dismiss(id)
 * ```
 */
export function useToast() {
  return {
    /** Every toast on screen, oldest first. `ToastHost` renders this. */
    toasts: readonly(items),
    info: (message: string, options?: ToastOptions) => push('info', message, options),
    success: (message: string, options?: ToastOptions) => push('success', message, options),
    warning: (message: string, options?: ToastOptions) => push('warning', message, options),
    danger: (message: string, options?: ToastOptions) => push('danger', message, options),
    dismiss,
    dismissAll,
    pause,
    resume,
  }
}
