<script setup lang="ts">
import { ref } from 'vue'

import {
  AvatarStack,
  BaseCard,
  BaseChip,
  BaseKbd,
  BaseLink,
  BaseRating,
  BaseSeparator,
  BaseSkeleton,
  CopyButton,
  SectionHeading,
} from '../src/index'
import { BASICS_PARTS } from './basics-parts'
import type { BasicsPartId } from './basics-parts'
import CodeBlock from './CodeBlock.vue'
import PropTable from './PropTable.vue'
import { NEUTRAL } from './tones'

/**
 * The small parts, one at a time.
 *
 * Each gets its own heading, a sentence on what it is for, a live demo, the
 * code that produced it and its props — and its own entry in the menu, so
 * somebody who arrives looking for a separator lands on the separator instead
 * of scanning a card that holds eight things at once.
 */
const chips = ref(['design', 'vue'])
const unpaidOnly = ref(false)
const score = ref(4)

const PEOPLE = [
  { name: 'Aiko Tanaka' },
  { name: 'Kenji Mori' },
  { name: 'Mei Lin' },
  { name: 'Ravi Patel' },
  { name: 'Sara Yilmaz' },
]

const part = (id: BasicsPartId) => BASICS_PARTS.find((one) => one.id === id)!

const CODE: Record<BasicsPartId, string> = {
  'basics-separator': `<!-- Labelled: a heading for what comes after it. -->
<BaseSeparator label="or" />

<!-- Unlabelled: decoration, and hidden from a screen reader. -->
<BaseSeparator />`,
  'basics-skeleton': `<div aria-busy="true">
  <BaseSkeleton shape="circle" height="2.5rem" />
  <BaseSkeleton shape="text" width="40%" height="0.75rem" />
</div>`,
  'basics-kbd': `Press <BaseKbd :keys="['⌘', 'K']" joiner="+" /> to search.`,
  'basics-chip': `<!-- Removable -->
<BaseChip
  v-for="tag in tags"
  :key="tag"
  :label="tag"
  :remove-label="\`Remove \${tag}\`"
  @remove="remove(tag)"
/>

<!-- Selectable -->
<BaseChip
  label="Unpaid"
  tone="warning"
  :selected="unpaidOnly"
  @select="unpaidOnly = !unpaidOnly"
/>`,
  'basics-avatars': `<AvatarStack
  :people="[{ name: 'Aiko Tanaka' }, { name: 'Kenji Mori' }]"
  :max="3"
  label="Shared with 5 people"
/>`,
  'basics-rating': `<!-- The value is read as words, not as shapes. -->
<BaseRating
  v-model="score"
  label="Your rating"
  :value-label="spoken"
/>

<!-- An average: shown, not answered. -->
<BaseRating :model-value="4" readonly size="sm" ... />`,
  'basics-link': `Read the <BaseLink href="/install">install guide</BaseLink>,
or the <BaseLink href="https://vuejs.org" external>Vue guide</BaseLink>.`,
  'basics-copy': `<CopyButton
  text="pnpm add rei-kit"
  copy-label="Copy the command"
  copied-label="Copied"
  error-label="Could not copy"
  with-text
/>`,
}
</script>

<template>
  <section id="basics" class="mt-14">
    <SectionHeading :tone="NEUTRAL" label="Basics" />
    <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
      The small parts every interface is made of. Each is one decision, and each has its own heading
      below — a rule that can carry a word, a grey box that takes a length rather than a class, a
      key that is a real <code class="text-xs">&lt;kbd&gt;</code>, a chip that can be taken off.
    </p>

    <!-- BaseSeparator -->
    <article :id="part('basics-separator').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-separator').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-separator').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink-soft text-sm">Signed in already?</p>
          <BaseSeparator label="or" />
          <p class="text-ink-soft text-sm">Create an account.</p>
          <BaseSeparator />
          <p class="text-ink-soft text-xs">Above: labelled. Between these two: plain.</p>
        </BaseCard>
        <CodeBlock :code="CODE['basics-separator']" />
      </div>
      <PropTable name="BaseSeparator" />
    </article>

    <!-- BaseSkeleton -->
    <article :id="part('basics-skeleton').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-skeleton').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-skeleton').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <div class="flex items-center gap-3" aria-busy="true">
            <BaseSkeleton shape="circle" height="2.5rem" />
            <div class="flex-1">
              <BaseSkeleton shape="text" width="40%" height="0.75rem" />
              <BaseSkeleton class="mt-2" shape="text" width="70%" height="0.75rem" />
            </div>
          </div>
          <BaseSkeleton class="mt-4" shape="block" height="4rem" />
        </BaseCard>
        <CodeBlock :code="CODE['basics-skeleton']" />
      </div>
      <PropTable name="BaseSkeleton" />
    </article>

    <!-- BaseKbd -->
    <article :id="part('basics-kbd').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-kbd').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-kbd').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink-soft text-sm">
            Press <BaseKbd :keys="['⌘', 'K']" joiner="+" /> to search.
          </p>
          <p class="text-ink-soft mt-3 text-sm">
            Then <BaseKbd :keys="['Esc']" /> to leave it, or
            <BaseKbd :keys="['⇧', '⌘', 'P']" joiner="+" /> for the palette.
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['basics-kbd']" lang="html" />
      </div>
      <PropTable name="BaseKbd" />
    </article>

    <!-- BaseChip -->
    <article :id="part('basics-chip').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-chip').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-chip').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <div class="flex flex-wrap items-center gap-2">
            <BaseChip
              v-for="tag in chips"
              :key="tag"
              :label="tag"
              :remove-label="`Remove ${tag}`"
              @remove="chips = chips.filter((one) => one !== tag)"
            />
            <BaseChip
              label="Unpaid"
              tone="warning"
              :selected="unpaidOnly"
              @select="unpaidOnly = !unpaidOnly"
            />
          </div>
          <p class="text-ink-soft mt-3 text-xs">
            {{ unpaidOnly ? 'Filtered to unpaid.' : 'Showing everything.' }}
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['basics-chip']" lang="html" />
      </div>
      <PropTable name="BaseChip" />
    </article>

    <!-- AvatarStack -->
    <article :id="part('basics-avatars').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-avatars').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-avatars').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <AvatarStack :people="PEOPLE" :max="3" label="Shared with 5 people" />
          <AvatarStack class="mt-4" :people="PEOPLE" :max="5" size="sm" label="The whole team" />
        </BaseCard>
        <CodeBlock :code="CODE['basics-avatars']" lang="html" />
      </div>
      <PropTable name="AvatarStack" />
    </article>

    <!-- BaseRating -->
    <article :id="part('basics-rating').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-rating').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-rating').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <div class="flex flex-wrap items-center gap-8">
            <div>
              <p class="text-ink-soft mb-1 text-xs">Yours — click, or use the arrows</p>
              <BaseRating
                v-model="score"
                label="Your rating"
                :value-label="(value, max) => `${value} out of ${max}`"
              />
            </div>
            <div>
              <p class="text-ink-soft mb-1 text-xs">The average — readonly</p>
              <BaseRating
                :model-value="4"
                readonly
                size="sm"
                label="Average"
                :value-label="(value, max) => `${value} out of ${max}`"
              />
            </div>
          </div>
          <p class="text-ink-soft mt-3 text-xs">You gave it {{ score }} out of 5.</p>
        </BaseCard>
        <CodeBlock :code="CODE['basics-rating']" lang="html" />
      </div>
      <PropTable name="BaseRating" />
    </article>

    <!-- BaseLink -->
    <article :id="part('basics-link').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-link').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-link').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink-soft text-sm">
            Read the <BaseLink href="#start">install guide</BaseLink>, or the
            <BaseLink href="https://vuejs.org" external>Vue guide</BaseLink>.
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['basics-link']" lang="html" />
      </div>
      <PropTable name="BaseLink" />
    </article>

    <!-- CopyButton -->
    <article :id="part('basics-copy').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('basics-copy').title }}</h3>
        <p class="sc-part-pitch">{{ part('basics-copy').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <CopyButton
            text="pnpm add rei-kit"
            copy-label="Copy the command"
            copied-label="Copied"
            error-label="Could not copy"
            with-text
          />
          <p class="text-ink-soft mt-3 text-xs">
            Without <code class="text-xs">with-text</code> it is the icon alone, which is what a
            code block wants.
          </p>
          <div class="mt-2">
            <CopyButton
              text="pnpm add rei-kit"
              copy-label="Copy the command"
              copied-label="Copied"
              error-label="Could not copy"
            />
          </div>
        </BaseCard>
        <CodeBlock :code="CODE['basics-copy']" lang="html" />
      </div>
      <PropTable name="CopyButton" />
    </article>
  </section>
</template>
