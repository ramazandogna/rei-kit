<script setup lang="ts">
import { computed } from 'vue'

import { CommandMenu } from '../src/web/index'
import catalogue from './props.generated.json'
import { SECTIONS } from './sections'
import { targetFor } from './targets'

/**
 * The page's own command menu, built from the kit's own component.
 *
 * The side menu is a list you read; this is a list you type at, and past
 * ninety components those are different problems. It is also the honest test
 * of `CommandMenu`: a demo that opens on a page of demos proves it renders,
 * while this one has to survive being the real way around a long document.
 *
 * Every entry goes to the same place the side menu sends it — both read
 * `targets.ts` — because two answers to "where is BaseModal" is one answer
 * too many.
 *
 * No row claims whether it has a demo. An earlier version labelled anything
 * outside a part list "props only", which was wrong for every component
 * demoed in a section that has not been split yet — `BaseDatePicker` has a
 * demo and was told it had none. A hint that is wrong is worse than no hint.
 */
/** Open or closed. The header's button drives it; ⌘K does too. */
const open = defineModel<boolean>({ default: false })

const groups = computed(() => [
  {
    label: 'Sections',
    items: SECTIONS.map((section) => ({
      id: section.id,
      label: section.label,
      // A sub-entry's label is a component name, which the component groups
      // below already carry. The section rows keep the page's own wording.
      keywords: ['section'],
    })),
  },
  ...['rei-kit', 'rei-kit/web', 'rei-kit/app', 'rei-kit/pwa', 'rei-kit/motion'].map((entry) => ({
    label: entry,
    items: catalogue
      .filter((component) => component.entry === entry)
      .map((component) => ({
        id: targetFor(component.name),
        label: component.name,
        hint: component.summary,
        // The one-line summary is searchable too, so "pick a date" finds the
        // date picker without knowing it is called that.
        keywords: [component.summary, entry],
      })),
  })),
])

function go(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.setAttribute('tabindex', '-1')

  /*
   * After the dialog has put focus back, not before.
   *
   * A dialog returns focus to whatever opened it, which is correct and is
   * also the last word — focusing the destination first simply loses. So
   * this waits a frame, and the next Tab then starts from the section that
   * was asked for rather than from the header button.
   */
  requestAnimationFrame(() => el.focus({ preventScroll: true }))
}
</script>

<template>
  <CommandMenu
    v-model="open"
    :groups="groups"
    label="Find anything in the kit"
    placeholder="Search components and sections…"
    empty-label="Nothing matches that."
    hotkey="k"
    @select="go"
  />
</template>
