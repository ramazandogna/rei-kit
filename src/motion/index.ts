/**
 * rei-kit/motion — numbers that count, words that change, content that
 * arrives.
 *
 * Every part here renders its final state on a server and for a reader who
 * asked for less motion, keeps assistive tech to the finished value, and
 * stops when hovered or focused if it moves on its own. The utilities that go
 * with them are in `rei-kit/motion.css`, which both presets include.
 *
 * @example
 * ```vue
 * <NumberTicker :value="balance" :format="{ style: 'currency', currency: 'TRY' }" />
 * ```
 *
 * @see {@link CountUp} — the near-neighbour this is mistaken for
 */
export { default as NumberTicker } from './NumberTicker.vue'
/**
 * A number that counts up to its value once it scrolls into view.
 *
 * @example
 * ```vue
 * <CountUp :value="12480" />
 * ```
 *
 * @see {@link NumberTicker} — the near-neighbour this is mistaken for
 */
export { default as CountUp } from './CountUp.vue'
/**
 * One word in a sentence that changes on its own: "Build it *glass*", then
 * *brutal*, then *soft*.
 *
 * @example
 * ```vue
 * <h1>Build it <TextRotate :words="['glass', 'brutal', 'soft']" /></h1>
 * ```
 */
export { default as TextRotate } from './TextRotate.vue'
/**
 * Text that types itself out, and — given several lines — deletes each one
 * and types the next.
 *
 * @example
 * ```vue
 * <TypeWriter :text="['Write it once.', 'Change the look.', 'Ship it.']" />
 * ```
 */
export { default as TypeWriter } from './TypeWriter.vue'
/**
 * Content that fades or rises into place as it scrolls into view.
 *
 * @example
 * ```vue
 * <BaseReveal v-for="(item, i) in items" :key="item" :delay="i * 80">
 *   <BaseCard>{{ item }}</BaseCard>
 * </BaseReveal>
 * ```
 */
export { default as BaseReveal } from './BaseReveal.vue'
/**
 * A row that scrolls sideways without end: logos, testimonials, a ticker.
 *
 * @example
 * ```vue
 * <BaseMarquee :duration="40">
 *   <BaseBadge v-for="name in names" :key="name">{{ name }}</BaseBadge>
 * </BaseMarquee>
 * ```
 */
export { default as BaseMarquee } from './BaseMarquee.vue'
/**
 * A decorative backdrop for a hero: dots, grid, aurora, blobs or grain, from
 * the palette, picked by the material when left on `auto`.
 *
 * @example
 * ```vue
 * <HeroBackdrop variant="aurora"><h1>Hello</h1></HeroBackdrop>
 * ```
 */
export { default as HeroBackdrop } from './HeroBackdrop.vue'
/**
 * A card with a light that follows the pointer and lights its edge.
 *
 * @example
 * ```vue
 * <SpotlightCard><h3>Fast</h3></SpotlightCard>
 * ```
 */
export { default as SpotlightCard } from './SpotlightCard.vue'
/**
 * A highlight that circles the border of whatever it wraps, then rests.
 *
 * @example
 * ```vue
 * <BorderBeam><BaseCard>Pro</BaseCard></BorderBeam>
 * ```
 */
export { default as BorderBeam } from './BorderBeam.vue'
/**
 * A line between two elements with a pulse of light travelling along it.
 *
 * @example
 * ```vue
 * <AnimatedBeam :container="box" :from="a" :to="b" />
 * ```
 */
export { default as AnimatedBeam } from './AnimatedBeam.vue'
