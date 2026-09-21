<script setup lang="ts" generic="T extends TimelineEvent">
import type { Component } from 'vue'

export interface TimelineEvent {
  /** Identity, and the name of this event's own body slot. */
  key: string
  /**
   * When it happened, **already formatted for the active locale**.
   *
   * A string rather than a date key, because only the app knows whether this
   * line should read "12 September", "2 hours ago" or "09:42" — and
   * `formatDate` is right there for the first of those.
   */
  time: string
  /** Already translated. Omit when the body says it. */
  title?: string | undefined
  /** A line under the title. Already translated. */
  description?: string | undefined
  /**
   * Background utility for the marker, e.g. `bg-positive`.
   *
   * A class rather than a category, the same contract as `ToneDot`: an app
   * keys it off whatever its own domain calls a kind — habit types, order
   * states, priorities — without this component knowing about any of them.
   */
  fill?: string | undefined
  /** Drawn inside the marker instead of a plain dot. */
  icon?: Component | undefined
}

/**
 * What happened, in order, on a rail.
 *
 * ## `Timeline` or `BaseStepper`
 *
 * A stepper is a process you are *in*: it has a current step, steps ahead
 * that have not happened, and — when it is interactive — steps behind you
 * can go back to. A timeline is a record of what already happened. It is
 * not a control, nothing in it is pressable unless the app puts a control
 * in the body, and there is no "next".
 *
 * Reaching for the wrong one shows: a stepper drawn from history implies
 * the reader can move through it, and a timeline drawn for a checkout
 * leaves them with no idea where they are.
 *
 * ## The rail is decoration
 *
 * The line and the dots are `aria-hidden`. What carries the meaning is that
 * this is an ordered list — `<ol>`, so a screen reader says "list, 5 items"
 * and numbers them — with each event's time read before its title. A rail
 * drawn with divs says nothing at all, which is what every hand-written one
 * does.
 *
 * The order is the app's. Newest first suits a note feed, because that is
 * the one somebody came back to read; oldest first suits a status trail.
 * The kit sorts nothing.
 *
 * ## The events are yours
 *
 * This is generic over whatever objects you pass, the way `BaseTable` is
 * generic over its rows: add your own fields and the slots hand them back
 * typed. That is what the body is for — a note, a card, a quote — and it
 * saves mapping your data into a shape that then has to be looked up again
 * by key.
 */
const { events, label } = defineProps<{
  events: readonly T[]
  /** Names the list. Already translated. */
  label: string
}>()

defineSlots<{
  /** The body of every event — a note, a card, a quote. */
  default?: (props: { event: T }) => unknown
  /** The body of one event, named for its key. Wins over `default`. */
  [key: string]: ((props: { event: T }) => unknown) | undefined
  /** The marker for every event, when a dot is not enough. */
  marker?: (props: { event: T }) => unknown
}>()
</script>

<template>
  <ol class="rk-timeline" :aria-label="label">
    <!-- One line behind the whole list rather than a segment per row: a
         segment per row leaves a hairline gap at every join. -->
    <span class="rk-timeline-rail" aria-hidden="true" />

    <li v-for="event in events" :key="event.key" class="rk-timeline-event">
      <span class="rk-timeline-marker" aria-hidden="true">
        <slot name="marker" :event="event">
          <span class="rk-timeline-dot" :class="event.fill ?? 'bg-primary'">
            <component :is="event.icon" v-if="event.icon" class="size-3" />
          </span>
        </slot>
      </span>

      <p class="rk-timeline-time">{{ event.time }}</p>
      <p v-if="event.title" class="rk-timeline-title">{{ event.title }}</p>
      <p v-if="event.description" class="rk-timeline-description">{{ event.description }}</p>

      <!-- Its own slot if it has one, the shared body if not: a feed has
           one shape for every row, and one odd row should not cost a slot
           per row. -->
      <div v-if="$slots[event.key] || $slots.default" class="rk-timeline-body">
        <slot v-if="$slots[event.key]" :name="event.key" :event="event" />
        <slot v-else :event="event" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.rk-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-inline-start: 1.5rem;
}

/* Stops short of both ends: a line running past the first and last dots
   reads as a sequence that continues out of view. */
.rk-timeline-rail {
  position: absolute;
  top: 0.5rem;
  bottom: 0.75rem;
  inset-inline-start: 0.25rem;
  width: 1px;
  background: var(--color-hair);
}

.rk-timeline-event {
  position: relative;
}

.rk-timeline-marker {
  position: absolute;
  top: 0.125rem;
  inset-inline-start: -1.5rem;
  display: grid;
  place-items: center;
}

/* The ring is the page's own ground, so the dot sits on the rail rather
   than being crossed by it. */
.rk-timeline-dot {
  display: grid;
  width: 0.625rem;
  height: 0.625rem;
  place-items: center;
  border-radius: 9999px;
  border: 2px solid var(--color-canvas);
  color: var(--color-on-primary);
}

.rk-timeline-time {
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink-soft);
}

.rk-timeline-title {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
}

.rk-timeline-description {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-ink-soft);
}

.rk-timeline-body {
  margin-top: 0.5rem;
}
</style>
