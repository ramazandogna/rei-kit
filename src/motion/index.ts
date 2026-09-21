/**
 * rei-kit/motion — numbers that count, words that change, content that
 * arrives.
 *
 * Every part here renders its final state on a server and for a reader who
 * asked for less motion, keeps assistive tech to the finished value, and
 * stops when hovered or focused if it moves on its own. The utilities that go
 * with them are in `rei-kit/motion.css`, which both presets include.
 */
export { default as NumberTicker } from './NumberTicker.vue'
/** A number that counts up to its value once it scrolls into view. */
export { default as CountUp } from './CountUp.vue'
/**
 * One word in a sentence that changes on its own: "Build it *glass*", then
 * *brutal*, then *soft*.
 */
export { default as TextRotate } from './TextRotate.vue'
/**
 * Text that types itself out, and — given several lines — deletes each one
 * and types the next.
 */
export { default as TypeWriter } from './TypeWriter.vue'
/** Content that fades or rises into place as it scrolls into view. */
export { default as BaseReveal } from './BaseReveal.vue'
/** A row that scrolls sideways without end: logos, testimonials, a ticker. */
export { default as BaseMarquee } from './BaseMarquee.vue'
