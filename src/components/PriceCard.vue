<script setup lang="ts">
import { computed } from 'vue'

/**
 * One plan in a pricing table.
 *
 * Every string arrives as a prop. A component in a kit that reaches for its
 * consumer's translations is not shared, it is one app's furniture parked
 * somewhere else — and the second app to want it would have to fork it.
 *
 * The tone is semantic rather than named after a colour. "Gold" and "diamond"
 * are one product's tiers; `warm` and `cool` are what a pricing table actually
 * needs, which is for three columns to be distinguishable at a glance without
 * any of them shouting. A table where every column is a different hue reads as
 * three products from three companies.
 */
const {
  name,
  lead,
  price,
  period,
  note,
  features,
  tone = 'neutral',
  badge,
  chip,
  recommended = false,
} = defineProps<{
  name: string
  lead?: string
  /** Already formatted, or whatever stands in while there is no price. */
  price: string
  period?: string
  note?: string
  features: readonly string[]
  tone?: 'neutral' | 'warm' | 'cool'
  /** Rides on the card's edge, e.g. "Recommended". */
  badge?: string
  /** Sits inside, e.g. "30% cheaper" or "Your plan". */
  chip?: string
  /** Raises the card and lets the badge show. */
  recommended?: boolean
}>()

const TONE = {
  neutral: {
    ring: 'border-hair/70',
    soft: 'bg-muted text-ink-soft',
    icon: 'bg-primary/10 text-primary',
  },
  warm: {
    ring: 'border-[color-mix(in_oklab,#b8862c_35%,transparent)]',
    soft: 'bg-[color-mix(in_oklab,#b8862c_14%,transparent)] text-[#8a6318] dark:text-[#d9ad5c]',
    icon: 'bg-[color-mix(in_oklab,#b8862c_16%,transparent)] text-[#8a6318] dark:text-[#d9ad5c]',
  },
  cool: {
    ring: 'border-[color-mix(in_oklab,#4a86a8_38%,transparent)]',
    soft: 'bg-[color-mix(in_oklab,#4a86a8_14%,transparent)] text-[#2f6079] dark:text-[#8fc6de]',
    icon: 'bg-[color-mix(in_oklab,#4a86a8_16%,transparent)] text-[#2f6079] dark:text-[#8fc6de]',
  },
} as const

const palette = computed(() => TONE[tone])
</script>

<template>
  <article
    class="bg-surface rounded-card relative flex h-full flex-col border p-7 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] duration-[420ms] hover:border-[color-mix(in_oklab,var(--color-primary)_60%,transparent)] hover:shadow-[var(--shadow-lift)] sm:p-8"
    :class="[palette.ring, recommended ? 'shadow-[var(--shadow-lift)]' : 'hover:-translate-y-0.5']"
  >
    <!-- On the edge rather than inside, so it cannot be mistaken for one of
         the plan's own features. -->
    <span
      v-if="badge && recommended"
      class="bg-primary rounded-cell absolute -top-3 left-7 px-3 py-1 text-[0.7rem] font-semibold text-white"
    >
      {{ badge }}
    </span>

    <div class="flex items-start justify-between gap-4">
      <span
        v-if="$slots.icon"
        class="rounded-card grid size-11 place-items-center text-xl"
        :class="palette.icon"
      >
        <slot name="icon" />
      </span>

      <span
        v-if="chip"
        class="rounded-cell ml-auto px-2.5 py-1 text-[0.7rem] font-medium"
        :class="palette.soft"
      >
        {{ chip }}
      </span>
    </div>

    <h3 class="text-ink mt-5 text-lg font-semibold">{{ name }}</h3>
    <p v-if="lead" class="text-ink-soft mt-1.5 text-sm leading-relaxed">{{ lead }}</p>

    <p class="mt-6 flex items-baseline gap-1.5">
      <span class="text-ink text-3xl font-semibold tracking-tight tabular-nums">{{ price }}</span>
      <span v-if="period" class="text-ink-soft text-sm">{{ period }}</span>
    </p>
    <p v-if="note" class="text-ink-soft mt-1 text-xs">{{ note }}</p>

    <ul class="mt-7 flex-1 space-y-3">
      <li v-for="feature in features" :key="feature" class="flex gap-3 text-sm">
        <span
          class="bg-primary/45 mt-[0.45rem] size-1.5 shrink-0 rounded-full"
          aria-hidden="true"
        />
        <span class="text-ink-soft leading-relaxed">{{ feature }}</span>
      </li>
    </ul>

    <div v-if="$slots.action" class="mt-8"><slot name="action" /></div>
  </article>
</template>
