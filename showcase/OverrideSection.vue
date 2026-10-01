<script setup lang="ts">
import { BaseButton, BaseCard, SectionHeading } from '../src/index'

import CodeBlock from './CodeBlock.vue'
import { NEUTRAL } from './tones'

/**
 * Changing one component, rather than all of them.
 *
 * The section above changes the whole page: that is what a palette and a
 * material are for. This is the other question every kit gets asked — "this
 * one card, square" — and the answer here is not a prop and not a class.
 *
 * It is not a class because it cannot be. Measured in a real build: a
 * consumer writing `class="rounded-[2px]"` against the kit's `rounded-card`
 * gets 16px, and `class="p-1"` against the kit's `p-4` gets 16px. Utilities
 * of equal specificity are resolved by their order in Tailwind's output, and
 * that order belongs to Tailwind rather than to whoever wrote the template.
 * Half of those overrides land and half are ignored, and the ignored half
 * says nothing.
 *
 * Setting the token on the element always wins, because a custom property is
 * inherited rather than sorted — there is nothing for it to race. That is the
 * same mechanism as `[--surface-shadow:…]`, which the kit already documented;
 * what was missing is that it works for every token, not just that one.
 */
const SAMPLE = `<!-- one square card, everything else untouched -->
<BaseCard class="[--radius-card:0px]">…</BaseCard>

<!-- one roomier card: --spacing scales every padding and gap inside it -->
<BaseCard class="[--spacing:0.35rem]">…</BaseCard>

<!-- the same trick the kit documents for depth -->
<BaseCard class="[--surface-shadow:var(--shadow-raised)]">…</BaseCard>`
</script>

<template>
  <section id="override" class="override">
    <div class="override-intro">
      <SectionHeading :tone="NEUTRAL" label="One component" />
      <h2 class="override-title">Change one part without changing the rest.</h2>
      <p class="override-lead">
        A palette or a material changes the page. To change a single component, set the token on
        that element. It is not a class override — a class loses to the kit's own about half the
        time, and silently, because Tailwind decides which of two equal utilities wins. A token set
        on the element is inherited, so there is nothing to race.
      </p>
    </div>

    <div class="override-row">
      <BaseCard class="override-demo">
        <p class="override-caption">Default</p>
        <BaseButton size="sm" variant="secondary">Button</BaseButton>
      </BaseCard>

      <BaseCard class="override-demo [--radius-card:0px]">
        <p class="override-caption"><code>[--radius-card:0px]</code></p>
        <BaseButton size="sm" variant="secondary">Button</BaseButton>
      </BaseCard>

      <BaseCard class="override-demo [--spacing:0.35rem]">
        <p class="override-caption"><code>[--spacing:0.35rem]</code></p>
        <BaseButton size="sm" variant="secondary">Button</BaseButton>
      </BaseCard>

      <BaseCard class="override-demo rounded-[2px]">
        <p class="override-caption override-caption-fails"><code>rounded-[2px]</code> — ignored</p>
        <BaseButton size="sm" variant="secondary">Button</BaseButton>
      </BaseCard>
    </div>

    <p class="override-lead">
      The fourth card is the thing most people try first, on the page so that it is not just a
      claim: its corners are still 16px. Nothing is broken and nothing warns you — the rule is
      there, and the kit's own simply comes later in the stylesheet.
    </p>

    <CodeBlock :code="SAMPLE" lang="vue" />
  </section>
</template>

<style scoped>
.override {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.override-intro {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.override-title {
  color: var(--color-ink);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
}

.override-lead {
  color: var(--color-ink-soft);
  max-width: var(--measure-reading);
  line-height: 1.6;
}

.override-row {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
}

.override-demo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.override-caption {
  color: var(--color-ink-soft);
  font-size: 0.75rem;
}

.override-caption code {
  font-family: ui-monospace, monospace;
}

.override-caption-fails {
  color: var(--color-negative);
}
</style>
