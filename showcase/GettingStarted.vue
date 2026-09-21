<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  MATERIALS,
  PALETTES,
  SectionHeading,
  SegmentedControl,
  useMaterial,
  usePalette,
} from '../src/index'
import pkg from '../package.json'
import CodeBlock from './CodeBlock.vue'
import InstallCommand from './InstallCommand.vue'
import { codeLanguage } from './preferences'
import { readableRange } from './versions'
import { NEUTRAL } from './tones'

/**
 * From an empty folder to a themed component, in the order a person does it.
 *
 * The kit is the third thing installed, not the first: a Vue app, then
 * Tailwind, then this. Saying so up front is what saves the hour somebody
 * would otherwise spend wondering why a component renders unstyled in a
 * project that never had Tailwind.
 */
const peers = pkg.peerDependencies

const REQUIREMENTS = [
  { name: 'Vue', version: readableRange(peers.vue), note: 'Composition API and <script setup>' },
  {
    name: 'Tailwind CSS',
    version: readableRange(peers.tailwindcss),
    note: 'Through its Vite plugin',
  },
  { name: 'Vite', version: '5.2+', note: 'Or any bundler Tailwind 4 supports' },
  {
    name: 'lucide-vue-next',
    version: readableRange(peers['lucide-vue-next']),
    note: 'Icons inside a few components',
  },
  {
    name: 'Browsers',
    version: 'Safari 16.4+, Chrome 111+, Firefox 128+',
    note: 'What Tailwind 4 targets',
  },
]

const OPTIONAL = [
  { name: 'vue-router', note: 'Components that navigate: TabBar, NavLinks, BaseBreadcrumb' },
  { name: 'vue-i18n', note: 'Only for the optional i18n runtime' },
  { name: '@supabase/supabase-js', note: 'Only for rei-kit/supabase' },
]

/* Split, because the literal closing tag would end this block. */
const SCRIPT_END = '</' + 'script>'

const TEMPLATE = computed(() => (codeLanguage.value === 'ts' ? 'vue-ts' : 'vue'))

const VITE_CONFIG = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})`

const STYLES = `@import 'tailwindcss';
@import 'rei-kit/mobile.css'; /* a phone-shaped app — or rei-kit/web.css for a site */`

const FIRST_TS = `<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard, BaseSwitch, ToastHost, useToast } from 'rei-kit'

const reminders = ref(true)
const toast = useToast()
${SCRIPT_END}

<template>
  <main class="canvas min-h-dvh p-6">
    <BaseCard>
      <BaseSwitch v-model="reminders" label="Daily reminder" />
      <BaseButton class="mt-4" @click="toast.success('Saved')">Save</BaseButton>
    </BaseCard>

    <ToastHost close-label="Close" />
  </main>
</template>`

const FIRST_JS = FIRST_TS.replace('<script setup lang="ts">', '<script setup>')

const palette = usePalette()
const material = useMaterial()

const COLOUR_WAYS = [
  { value: 'palette', label: 'A palette' },
  { value: 'brand', label: 'Your brand' },
] as const
const MATERIAL_WAYS = [
  { value: 'once', label: 'Decide once' },
  { value: 'users', label: 'Let users choose' },
] as const

const colourWay = ref<'palette' | 'brand'>('palette')
const materialWay = ref<'once' | 'users'>('once')

const paletteCode = computed(
  () => `<html data-palette="${palette.value}">

<!-- or at runtime, remembered per device:
     usePalette().value = '${palette.value}' -->`,
)

const BRAND = `/* after the two imports */
@theme {
  --color-primary: #6b4de6;
  --color-accent: #3b2f8f;
}

.dark {
  --color-primary: #a18cf5;
}`

const materialCode = computed(() => `<html data-material="${material.value}">`)

const USERS_TS = `<script setup lang="ts">
import { MATERIALS, SegmentedControl, useMaterial } from 'rei-kit'

const material = useMaterial() // remembered per device
const options = MATERIALS.map((value) => ({ value, label: value }))
${SCRIPT_END}

<template>
  <SegmentedControl v-model="material" :options="options" />
</template>`

const USERS_JS = USERS_TS.replace('<script setup lang="ts">', '<script setup>')

/* Each tab pair shares the height of its longer sample, so switching tabs
   swaps the code without moving anything below it. */
const lineCount = (...samples: string[]) => Math.max(...samples.map((s) => s.split('\n').length))
const COLOUR_LINES = lineCount(
  `<html data-palette="rei">\n\n<!-- or at runtime, remembered per device:\n     usePalette().value = 'rei' -->`,
  BRAND,
)
const MATERIAL_LINES = lineCount(USERS_TS)

const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`
</script>

<template>
  <section id="start" class="gs">
    <div class="gs-intro">
      <SectionHeading :tone="NEUTRAL" label="Get started" />
      <h2 class="gs-title">From an empty folder to your first screen.</h2>
      <p class="gs-lead">
        rei-kit sits on top of two things you install first: a Vue app and Tailwind CSS. Five steps,
        about three minutes. Every command follows the package manager you pick, and every sample
        switches between TypeScript and JavaScript — the kit ships its own types, so TypeScript gets
        autocomplete and checking, and JavaScript works the same without them.
      </p>
    </div>

    <!-- Requirements -->
    <div class="gs-req">
      <div class="surface rounded-card p-5">
        <h3 class="gs-h3">What it runs on</h3>
        <dl class="mt-3 grid gap-2.5">
          <div v-for="r in REQUIREMENTS" :key="r.name" class="gs-row">
            <dt class="text-ink text-sm font-medium">{{ r.name }}</dt>
            <dd class="text-ink text-sm tabular-nums">{{ r.version }}</dd>
            <dd class="text-ink-soft text-xs">{{ r.note }}</dd>
          </div>
        </dl>
      </div>
      <div class="surface rounded-card p-5">
        <h3 class="gs-h3">Only if you use them</h3>
        <dl class="mt-3 grid gap-2.5">
          <div v-for="o in OPTIONAL" :key="o.name">
            <dt class="text-ink font-mono text-[0.8125rem]">{{ o.name }}</dt>
            <dd class="text-ink-soft text-xs">{{ o.note }}</dd>
          </div>
        </dl>
        <p class="text-ink-soft mt-4 text-xs leading-relaxed">
          Works with server rendering and prerendering — nothing touches the browser on import.
        </p>
      </div>
    </div>

    <!-- Steps -->
    <ol class="gs-steps">
      <li class="gs-step">
        <div class="gs-step-copy">
          <h3 class="gs-h3">Create a Vue app</h3>
          <p>
            Skip this if you have one. The template follows your TS/JS choice below:
            <code>{{ TEMPLATE }}</code
            >.
          </p>
        </div>
        <InstallCommand kind="create" :args="`my-app --template ${TEMPLATE}`" />
      </li>

      <li class="gs-step">
        <div class="gs-step-copy">
          <h3 class="gs-h3">Add Tailwind CSS 4</h3>
          <p>The kit's styles are Tailwind utilities, so Tailwind builds them into your CSS.</p>
        </div>
        <div class="grid gap-3">
          <InstallCommand kind="add-dev" args="tailwindcss @tailwindcss/vite" />
          <CodeBlock
            :code="VITE_CONFIG"
            :file="codeLanguage === 'ts' ? 'vite.config.ts' : 'vite.config.js'"
          />
        </div>
      </li>

      <li class="gs-step">
        <div class="gs-step-copy">
          <h3 class="gs-h3">Add rei-kit</h3>
          <p>With the icon set a few components draw with. No other runtime dependencies.</p>
        </div>
        <InstallCommand kind="add" args="rei-kit lucide-vue-next" />
      </li>

      <li class="gs-step">
        <div class="gs-step-copy">
          <h3 class="gs-h3">Import the styles</h3>
          <p>
            Replace what is in your stylesheet with these two lines. They bring every component's
            styles, all four materials, all ten palettes and the motion utilities, and tell Tailwind
            where the components are.
          </p>
        </div>
        <CodeBlock :code="STYLES" file="src/style.css" lang="css" />
      </li>

      <li class="gs-step">
        <div class="gs-step-copy">
          <h3 class="gs-h3">Use a component</h3>
          <p>
            Import what you need from <code>rei-kit</code>; anything you do not import is not in
            your bundle. Every component below has a sample like this one.
          </p>
        </div>
        <CodeBlock :code="FIRST_TS" :js="FIRST_JS" file="src/App.vue" />
      </li>
    </ol>

    <!-- Make it yours -->
    <div id="make-it-yours" class="mk">
      <div class="gs-intro">
        <h3 class="mk-title">Make it yours — without touching a component.</h3>
        <p class="gs-lead">
          Two decisions, each a line of CSS or one attribute: the colours, and what the surfaces are
          made of. Try them here — this page follows.
        </p>
      </div>

      <!-- Colour -->
      <div class="mk-row">
        <div class="mk-panel surface">
          <p class="mk-kicker">Colour</p>
          <h4 class="mk-name">Pick a palette, or bring your brand</h4>
          <p class="mk-text">
            Ten palettes, each measured against WCAG AA in light and dark. Or set your own colours;
            the text on each filled colour is picked for you.
          </p>
          <div class="gs-swatches">
            <button
              v-for="p in PALETTES"
              :key="p.name"
              type="button"
              class="gs-swatch focus-ring"
              :aria-pressed="palette === p.name"
              @click="palette = p.name"
            >
              <span class="gs-pie" :style="{ background: pie(p.swatch) }" aria-hidden="true" />
              <span class="text-ink truncate text-xs">{{ p.label }}</span>
            </button>
          </div>
        </div>

        <div class="mk-code">
          <SegmentedControl v-model="colourWay" :options="COLOUR_WAYS" />
          <CodeBlock
            v-if="colourWay === 'palette'"
            :code="paletteCode"
            file="index.html"
            lang="html"
            :lines="COLOUR_LINES"
          />
          <CodeBlock v-else :code="BRAND" file="src/style.css" lang="css" :lines="COLOUR_LINES" />
        </div>
      </div>

      <!-- Material -->
      <div class="mk-row">
        <div class="mk-panel surface">
          <p class="mk-kicker">Material</p>
          <h4 class="mk-name">Decide it once, or let your users choose</h4>
          <p class="mk-text">
            What every surface is made of. Hibi and Kakei put the choice in their settings; one line
            of code does it.
          </p>
          <div class="mk-materials">
            <button
              v-for="m in MATERIALS"
              :key="m"
              type="button"
              class="mk-material canvas focus-ring"
              :data-material="m"
              :aria-pressed="material === m"
              @click="material = m"
            >
              <span class="mk-material-card surface">
                <span class="mk-material-bar bg-primary" />
                <span class="mk-material-line" />
              </span>
              <span class="text-ink text-xs font-medium capitalize">{{ m }}</span>
            </button>
          </div>
        </div>

        <div class="mk-code">
          <SegmentedControl v-model="materialWay" :options="MATERIAL_WAYS" />
          <CodeBlock
            v-if="materialWay === 'once'"
            :code="materialCode"
            file="index.html"
            lang="html"
            :lines="MATERIAL_LINES"
          />
          <CodeBlock
            v-else
            :code="USERS_TS"
            :js="USERS_JS"
            file="Settings.vue"
            :lines="MATERIAL_LINES"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gs {
  padding-top: 4.5rem;
}

.gs-intro {
  max-width: 46rem;
}

.gs-title {
  margin-top: 1rem;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}

.gs-title-sm {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.gs-lead {
  margin-top: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-ink-soft);
}

.gs-h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.gs-h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
}

.gs code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125em;
  color: var(--color-ink);
}

.gs-req {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 56rem) {
  .gs-req {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
}

.gs-row {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  column-gap: 1rem;
}

.gs-row dd:last-child {
  grid-column: 2;
}

.gs-steps {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.75rem;
  counter-reset: step;
}

.gs-step {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.875rem;
  counter-increment: step;
}

@media (min-width: 56rem) {
  .gs-step {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 2rem;
    align-items: start;
  }
}

.gs-step-copy {
  position: relative;
  padding-inline-start: 2.75rem;
}

/* The step number, drawn by the list itself so it can never skip one. */
.gs-step-copy::before {
  content: counter(step);
  position: absolute;
  inset-inline-start: 0;
  top: -0.125rem;
  display: grid;
  width: 1.875rem;
  height: 1.875rem;
  place-items: center;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.8125rem;
  font-weight: 700;
}

.gs-step-copy p {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-ink-soft);
}

.mk {
  margin-top: 4rem;
}

.mk-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

/* A picker you use and the line it writes, side by side from a laptop up. */
.mk-row {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (min-width: 56rem) {
  .mk-row {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }
}

.mk-panel {
  border-radius: var(--radius-card);
  padding: 1.25rem;
}

.mk-kicker {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.mk-name {
  margin-top: 0.375rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-ink);
}

.mk-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-ink-soft);
}

.mk-code {
  display: grid;
  gap: 0.75rem;
}

.mk-materials {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

/* Each tile is a tiny page in its own material, so all four sit side by side
   whatever the page itself is set to. */
.mk-material {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  border-radius: calc(var(--radius-card) + 4px);
  padding: 0.625rem 0.5rem;
  background-attachment: scroll;
  transition: transform var(--duration-base) var(--ease-standard);
}

.mk-material:hover {
  transform: translateY(-2px);
}

.mk-material[aria-pressed='true'] {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.mk-material-card {
  display: grid;
  width: 100%;
  gap: 0.375rem;
  border-radius: var(--radius-card);
  padding: 0.5rem;
}

.mk-material-bar {
  height: 0.5rem;
  width: 60%;
  border-radius: 9999px;
}

.mk-material-line {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--color-muted);
}

.gs-swatches {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.5rem;
}

.gs-swatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem 0.25rem 0.25rem;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.gs-swatch:hover,
.gs-swatch[aria-pressed='true'] {
  background: var(--color-muted);
}

.gs-pie {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 12%, transparent);
}
</style>
