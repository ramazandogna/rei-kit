<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue'

import { formatNumber } from '../utils/format'
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import SegmentedControl from './SegmentedControl.vue'

/**
 * Several plans side by side, with a monthly / yearly switch that changes every
 * price at once.
 *
 * Distinct from `PriceCard`, which is one tier: this is the whole block, with
 * the group heading, the period control and the tiers. The featured plan gets a
 * ring, a lift and a badge saying why — never colour alone. Prices tween to
 * their new value, instantly for a reader who asked for less motion (and in
 * brutal, which jumps). The change is announced politely: "Yearly prices shown".
 *
 * Plans with a `cta.href` render a link; the rest render a button that emits
 * `select` with the plan id. The `plan` slot replaces a tier's body.
 *
 * @example
 * ```vue
 * <PricingCard v-model:period="period" label="Pricing" save-label="Save 20%" :plans="plans" />
 * ```
 */
interface Plan {
  id: string
  name: string
  lead?: string | undefined
  monthly: number
  yearly: number
  features: readonly string[]
  cta: { label: string; href?: string | undefined }
  featured?: boolean | undefined
  badge?: string | undefined
}
type Period = 'monthly' | 'yearly'

const {
  plans,
  label,
  currency = 'USD',
  locale = undefined,
  periodLabels = { monthly: 'Monthly', yearly: 'Yearly' },
  saveLabel = undefined,
  perLabels = { monthly: '/month', yearly: '/year' },
  headingLevel = 2,
} = defineProps<{
  plans: readonly Plan[]
  /** The group heading, e.g. "Pricing". */
  label: string
  currency?: string | undefined
  locale?: string | undefined
  periodLabels?: Record<Period, string> | undefined
  /** e.g. "Save 20%", shown beside the period switch. */
  saveLabel?: string | undefined
  perLabels?: Record<Period, string> | undefined
  headingLevel?: 2 | 3 | 4 | 5 | undefined
}>()

const period = defineModel<Period>('period', { default: 'monthly' })

const emit = defineEmits<{ select: [planId: string] }>()

defineSlots<{
  plan?: (props: { plan: Plan; price: string; period: Period }) => unknown
  footer?: () => unknown
}>()

const id = useId()
const root = useTemplateRef<HTMLElement>('root')
const options = computed(() => [
  { value: 'monthly' as const, label: periodLabels.monthly },
  { value: 'yearly' as const, label: periodLabels.yearly },
])

const target = (plan: Plan) => (period.value === 'yearly' ? plan.yearly : plan.monthly)
const shown = ref<Record<string, number>>(Object.fromEntries(plans.map((p) => [p.id, target(p)])))

const money = (value: number) =>
  formatNumber(
    value,
    {
      style: 'currency',
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    },
    locale,
  )

const price = (plan: Plan) => money(shown.value[plan.id] ?? target(plan))

/** The slow duration token, in ms: zero under reduced motion. */
function tokenMs(): number {
  const el = root.value
  if (!el) return 0
  if (el.closest('[data-material="brutal"]')) return 0
  const raw = getComputedStyle(el).getPropertyValue('--duration-slow').trim()
  const n = parseFloat(raw)

  return Number.isNaN(n) ? 0 : raw.endsWith('ms') ? n : n * 1000
}

let frame = 0
const announced = ref('')

watch(period, () => {
  announced.value = `${periodLabels[period.value]} prices shown`
  cancelAnimationFrame(frame)
  const from = { ...shown.value }
  const ms = tokenMs()
  const to = Object.fromEntries(plans.map((p) => [p.id, target(p)]))
  if (ms <= 0 || typeof requestAnimationFrame === 'undefined') {
    shown.value = to
    return
  }
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const e = 1 - (1 - t) ** 3
    shown.value = Object.fromEntries(
      plans.map((p) => [
        p.id,
        (from[p.id] ?? to[p.id]!) + (to[p.id]! - (from[p.id] ?? to[p.id]!)) * e,
      ]),
    )
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
})

onMounted(() => (shown.value = Object.fromEntries(plans.map((p) => [p.id, target(p)]))))
onBeforeUnmount(() => cancelAnimationFrame(frame))

const level = computed(() => Math.min(6, headingLevel + 1))
</script>

<template>
  <section ref="root" class="pc" :aria-labelledby="`${id}-h`">
    <header class="pc-head">
      <component :is="`h${headingLevel}`" :id="`${id}-h`" class="pc-title">{{ label }}</component>
      <div class="pc-switch">
        <SegmentedControl v-model="period" :options="options" class="pc-seg" />
        <BaseBadge v-if="saveLabel" tone="success">{{ saveLabel }}</BaseBadge>
      </div>
    </header>

    <div class="pc-grid">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="pc-plan surface rounded-card"
        :class="{ 'is-featured': plan.featured }"
        :aria-labelledby="`${id}-${plan.id}`"
      >
        <BaseBadge v-if="plan.featured" tone="primary" class="pc-badge">
          {{ plan.badge ?? 'Popular' }}
        </BaseBadge>
        <slot name="plan" :plan="plan" :price="price(plan)" :period="period">
          <component :is="`h${level}`" :id="`${id}-${plan.id}`" class="pc-name">{{
            plan.name
          }}</component>
          <p v-if="plan.lead" class="pc-lead">{{ plan.lead }}</p>
          <p class="pc-price">
            <span class="pc-amount">{{ price(plan) }}</span>
            <span class="pc-per">{{ perLabels[period] }}</span>
          </p>
          <ul class="pc-features">
            <li v-for="feature in plan.features" :key="feature">
              <Check class="pc-check" aria-hidden="true" />
              {{ feature }}
            </li>
          </ul>
          <BaseButton
            :as="plan.cta.href ? 'a' : 'button'"
            :href="plan.cta.href"
            :variant="plan.featured ? 'primary' : 'secondary'"
            block
            class="pc-cta"
            @click="plan.cta.href || emit('select', plan.id)"
          >
            {{ plan.cta.label }}
          </BaseButton>
        </slot>
      </article>
    </div>

    <slot name="footer" />
    <p class="sr-only" role="status" aria-live="polite">{{ announced }}</p>
  </section>
</template>

<style scoped>
.pc-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}
.pc-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-ink);
}
.pc-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.pc-seg {
  min-width: 14rem;
}

.pc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}

.pc-plan {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
}

.pc-plan.is-featured {
  box-shadow:
    0 0 0 2px var(--color-primary),
    var(--shadow-raised);
}
:where([data-material='brutal']) .pc-plan.is-featured {
  box-shadow:
    0 0 0 2px var(--color-primary),
    var(--shadow-raised);
}
@media (min-width: 1024px) {
  .pc-plan.is-featured {
    scale: 1.02;
  }
}

.pc-badge {
  align-self: flex-start;
}
.pc-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-ink);
}
.pc-lead {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}
.pc-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin: 0.25rem 0;
  color: var(--color-ink);
}
.pc-amount {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.pc-per {
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.pc-features {
  display: grid;
  flex: 1 1 auto;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  color: var(--color-ink);
}
.pc-features li {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}
.pc-check {
  flex: none;
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  color: var(--color-positive);
}
</style>
