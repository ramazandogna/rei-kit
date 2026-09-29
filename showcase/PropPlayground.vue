<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import * as kit from 'rei-kit'
import * as app from 'rei-kit/app'
import * as motion from 'rei-kit/motion'
import * as pwa from 'rei-kit/pwa'
import * as web from 'rei-kit/web'

import CodeBlock from './CodeBlock.vue'
import { controlsFor, initialValue, snippetFor, type Control } from './playground-controls'
import { NOT_PLAYABLE, SLOT_TEXT } from './playground-seeds'
import catalogue from './props.generated.json'

/**
 * One component, with its props on knobs.
 *
 * The gallery says what a part looks like and the table says what it takes;
 * neither lets anybody ask "what does `variant="ghost"` do at `size="xs"`",
 * which is the question somebody deciding whether to install this actually
 * has. Reading a kit and trying one are different things, and until this
 * existed the showcase only offered the first.
 *
 * Every control here is derived from `props.generated.json` — the same file
 * the prop table reads, regenerated from the source before each build. So a
 * new variant appears as a button without anybody adding one, and the
 * playground cannot offer a prop the component does not have.
 */
const { name } = defineProps<{ name: string }>()

const FIELD_CLASS =
  'control rounded-cell border-hair text-ink focus-visible:outline-primary border px-2 py-1 font-mono text-[0.7rem] focus-visible:outline-2 focus-visible:outline-offset-1'

const NAMESPACES: Record<string, Record<string, unknown>> = {
  'rei-kit': kit as Record<string, unknown>,
  'rei-kit/web': web as Record<string, unknown>,
  'rei-kit/app': app as Record<string, unknown>,
  'rei-kit/pwa': pwa as Record<string, unknown>,
  'rei-kit/motion': motion as Record<string, unknown>,
}

const entry = computed(() => catalogue.find((item) => item.name === name))

const controls = computed<Control[]>(() => (entry.value ? controlsFor(entry.value) : []))

/* Derived rather than listed: a component is playable when every prop it
   requires has a control, so one that needs a function or an array of rows
   drops out by itself. The deny list is the second half — the ones that
   qualify on their types and would still render an empty box. */
const playable = computed(() => {
  const item = entry.value
  if (!item || NOT_PLAYABLE[item.name]) return false
  if (controls.value.length === 0) return false

  const covered = new Set(controls.value.map((control) => control.prop.name))
  return item.props.every((prop) => !prop.required || covered.has(prop.name))
})

const values = ref<Record<string, unknown>>({})

watch(
  controls,
  (list) => {
    values.value = Object.fromEntries(
      list.map((control) => [control.prop.name, initialValue(control)]),
    )
  },
  { immediate: true },
)

const slot = computed(() => SLOT_TEXT[name] ?? null)

const component = computed(() => {
  const item = entry.value
  if (!item) return null
  return (NAMESPACES[item.entry]?.[item.name] ?? null) as object | null
})

const snippet = computed(() => snippetFor(name, controls.value, values.value, slot.value))

const reset = () => {
  values.value = Object.fromEntries(
    controls.value.map((control) => [control.prop.name, initialValue(control)]),
  )
}

const changed = computed(() =>
  controls.value.some((control) => values.value[control.prop.name] !== initialValue(control)),
)
</script>

<template>
  <details v-if="playable && component" class="border-hair/70 mt-4 border-t pt-3">
    <summary class="text-ink-soft hover:text-ink cursor-pointer text-xs font-medium">
      Try it — {{ controls.length }} {{ controls.length === 1 ? 'prop' : 'props' }} you can change
    </summary>

    <div class="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="flex flex-col gap-3">
        <div
          class="canvas rounded-card border-hair flex min-h-28 items-center justify-center border p-6"
        >
          <component :is="component" v-bind="values">
            <template v-if="slot">{{ slot }}</template>
          </component>
        </div>

        <CodeBlock :code="snippet" />
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="control in controls" :key="control.prop.name" class="flex flex-col gap-1">
          <label
            :for="`pg-${name}-${control.prop.name}`"
            class="text-ink flex items-baseline justify-between gap-2 text-xs font-medium"
          >
            <span class="font-mono">{{ control.prop.name }}</span>
            <span v-if="control.prop.required" class="text-negative text-[0.65rem]">required</span>
          </label>

          <div v-if="control.kind === 'enum'" class="flex flex-wrap gap-1">
            <button
              v-for="option in control.options"
              :key="option"
              type="button"
              class="focus-ring rounded-cell border px-2 py-1 font-mono text-[0.7rem]"
              :class="
                values[control.prop.name] === option
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-hair control text-ink-soft hover:text-ink'
              "
              :aria-pressed="values[control.prop.name] === option"
              @click="values[control.prop.name] = option"
            >
              {{ option }}
            </button>
          </div>

          <button
            v-else-if="control.kind === 'boolean'"
            :id="`pg-${name}-${control.prop.name}`"
            type="button"
            class="focus-ring rounded-cell border-hair control text-ink-soft hover:text-ink border px-2 py-1 text-left font-mono text-[0.7rem]"
            :aria-pressed="Boolean(values[control.prop.name])"
            @click="values[control.prop.name] = !values[control.prop.name]"
          >
            {{ values[control.prop.name] ? 'true' : 'false' }}
          </button>

          <input
            v-else-if="control.kind === 'number'"
            :id="`pg-${name}-${control.prop.name}`"
            v-model.number="values[control.prop.name]"
            type="number"
            :class="FIELD_CLASS"
          />

          <input
            v-else
            :id="`pg-${name}-${control.prop.name}`"
            v-model="values[control.prop.name]"
            type="text"
            :class="FIELD_CLASS"
          />
        </div>

        <button
          type="button"
          class="focus-ring text-ink-soft hover:text-ink self-start text-xs underline disabled:opacity-40"
          :disabled="!changed"
          @click="reset"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  </details>
</template>
