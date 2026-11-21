<script setup lang="ts">
import { FAQ } from './home-content'

/* Native <details>: no JS, keyboard and screen-reader support for free, and
   the answers stay in the DOM, so the FAQPage JSON-LD matches what is shown. */
</script>

<template>
  <section id="faq" class="site-page site-section" aria-labelledby="faq-h">
    <p class="site-eyebrow">FAQ</p>
    <h2 id="faq-h" class="site-h2">Frequently asked questions</h2>
    <div class="faq-list">
      <details v-for="(item, i) in FAQ" :key="item.q" class="faq-item surface" :open="i === 0">
        <summary class="faq-q">
          <h3 class="site-h3">{{ item.q }}</h3>
          <span class="faq-mark" aria-hidden="true" />
        </summary>
        <p class="faq-a">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.faq-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
  max-width: 52rem;
}
.faq-item {
  border-radius: var(--radius-lg, 0.75rem);
  padding: 0;
}
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  list-style: none;
  border-radius: inherit;
}
.faq-q::-webkit-details-marker {
  display: none;
}
.faq-q:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.faq-q h3 {
  margin: 0;
  font-size: var(--site-text-base, 1rem);
}
.faq-mark {
  flex: none;
  width: 0.625rem;
  height: 0.625rem;
  border-inline-end: 2px solid var(--color-ink-soft);
  border-bottom: 2px solid var(--color-ink-soft);
  transform: rotate(45deg) translateY(-2px);
  transition: transform var(--duration-fast, 150ms) ease;
}
.faq-item[open] .faq-mark {
  transform: rotate(-135deg) translateY(-2px);
}
.faq-a {
  margin: 0;
  padding: 0 1.25rem 1.25rem;
  color: var(--color-ink-soft);
  line-height: 1.6;
  max-width: 70ch;
}
</style>
