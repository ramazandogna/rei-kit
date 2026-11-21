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
 */
export { default as NumberTicker } from './NumberTicker.vue'
/**
 * A number that counts up to its value once it scrolls into view.
 *
 * @example
 * ```vue
 * <CountUp :value="12480" />
 * ```
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
 * <HeroBackdrop variant="auto" class="rounded-card px-6 py-16 text-center">
 *   <h2 class="text-ink text-2xl font-semibold">Change one attribute</h2>
 *   <p class="text-ink-soft mt-2 text-sm">The backdrop follows the material.</p>
 * </HeroBackdrop>
 * ```
 */
export { default as HeroBackdrop } from './HeroBackdrop.vue'
/**
 * A card with a light that follows the pointer and lights its edge.
 *
 * @example
 * ```vue
 * <SpotlightCard>
 *   <h3 class="text-ink font-semibold">Move over me</h3>
 *   <p class="text-ink-soft mt-1 text-sm">A light follows the pointer and lights the edge.</p>
 * </SpotlightCard>
 * ```
 */
export { default as SpotlightCard } from './SpotlightCard.vue'
/**
 * A highlight that circles the border of whatever it wraps, then rests.
 *
 * @example
 * ```vue
 * <BorderBeam radius="card">
 *   <div class="surface rounded-card p-5">
 *     <p class="text-ink text-sm font-medium">A highlight circles the edge, then rests.</p>
 *   </div>
 * </BorderBeam>
 * ```
 */
export { default as BorderBeam } from './BorderBeam.vue'
/**
 * A line between two elements with a pulse of light travelling along it.
 *
 * @example
 * ```vue
 * <div ref="box" class="relative flex items-center justify-between px-6 py-10">
 *   <div ref="a" class="surface rounded-control px-4 py-2 text-sm">Source</div>
 *   <div ref="b" class="surface rounded-control px-4 py-2 text-sm">Hub</div>
 *   <AnimatedBeam :container="box" :from="a" :to="b" :curvature="40" />
 *   <p class="sr-only">Source sends data to Hub.</p>
 * </div>
 * ```
 */
export { default as AnimatedBeam } from './AnimatedBeam.vue'
/**
 * A card that leans toward the pointer, with a sliding sheen; focus lifts it
 * instead of tilting it.
 *
 * @example
 * ```vue
 * <TiltCard>
 *   <h3 class="text-ink font-semibold">Lean in</h3>
 *   <p class="text-ink-soft mt-1 text-sm">Hover to tilt. Focus lifts it instead.</p>
 * </TiltCard>
 * ```
 */
export { default as TiltCard } from './TiltCard.vue'
