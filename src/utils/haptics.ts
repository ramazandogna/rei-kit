/**
 * A short vibration for a confirmed tap.
 *
 * Optional chaining is not decoration: iOS Safari has no `vibrate` at all, and
 * calling it unguarded would throw on every marked day.
 *
 * @param duration - Milliseconds. Keep it under ~15ms; longer reads as an alert.
 */
export function tapFeedback(duration = 10): void {
  navigator.vibrate?.(duration)
}
