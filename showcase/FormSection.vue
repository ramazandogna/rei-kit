<script setup lang="ts">
import { Bold, Italic, LayoutGrid, List, Underline } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import {
  BaseCard,
  BaseCheckbox,
  BaseCombobox,
  BaseInput,
  BaseListbox,
  BaseRadioGroup,
  BaseSelect,
  BaseSlider,
  BaseSwitch,
  BaseTextarea,
  ColorPicker,
  FileDrop,
  FormField,
  NumberInput,
  PinInput,
  PALETTES,
  SectionHeading,
  SegmentedControl,
  SliderField,
  TagsInput,
  ToggleGroup,
  useToast,
} from '../src/index'
import CodeBlock from './CodeBlock.vue'
import { FORM_GROUPS, FORM_PARTS } from './form-parts'
import type { FormGroupId, FormPartId } from './form-parts'
import PropTable from './PropTable.vue'
import { NEUTRAL } from './tones'

/**
 * Every control that takes an answer, one at a time.
 *
 * Grouped by the kind of answer rather than by what fitted in the first card:
 * text and choice, then the closed questions, then the ones with a shape. The
 * page used to call the second half "Form — continued", which told somebody
 * looking for a switch only that it was further down.
 */
const toast = useToast()

const email = ref('')
const note = ref('')
const currency = ref<string | undefined>()
const country = ref<'tr' | 'jp' | 'de' | ''>('')
const access = ref<string[]>(['aiko'])
const recipients = ref<string[]>(['aiko'])

const remember = ref(false)
const reminder = ref(true)
const themeChoice = ref('system')
const segment = ref('all')
const marks = ref<string[]>(['bold'])
const view = ref<string | undefined>('list')

const guests = ref<number | undefined>(2)
const minutes = ref(45)
const opacity = ref(40)
const code = ref('')
const tags = ref(['design'])
const files = ref<File[]>([])
const brand = ref('#6b4de6')

/* The kit ships no colours of its own; these are the palettes' first roles,
   which is one ready source an app can reach for. */
const SWATCHES = PALETTES.map((palette) => ({
  value: palette.swatch[0]!,
  label: palette.name,
}))

const sliderText = computed(() => `${minutes.value} minutes`)

const COUNTRIES = [
  { value: 'tr', label: 'Türkiye' }, // an endonym, on purpose
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
] as const

const CURRENCIES = [
  { value: 'TRY', label: 'Turkish lira' },
  { value: 'JPY', label: 'Japanese yen' },
  { value: 'EUR', label: 'Euro' },
]

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const SEGMENTS = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]

const MARKS = [
  { value: 'bold', label: 'Bold', icon: Bold, iconOnly: true },
  { value: 'italic', label: 'Italic', icon: Italic, iconOnly: true },
  { value: 'underline', label: 'Underline', icon: Underline, iconOnly: true },
]

const VIEWS = [
  { value: 'list', label: 'List', icon: List },
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
]

const PEOPLE = [
  { value: 'aiko', label: 'Aiko Tanaka' },
  { value: 'kenji', label: 'Kenji Mori' },
  { value: 'mei', label: 'Mei Lin' },
  { value: 'ravi', label: 'Ravi Patel' },
]

const part = (id: FormPartId) => FORM_PARTS.find((one) => one.id === id)!
const group = (id: FormGroupId) => FORM_GROUPS.find((one) => one.id === id)!

/**
 * A stand-in for a server, so the page can show the state a real one puts
 * the control in without needing one.
 */
const cities = ref<{ value: string; label: string }[]>([])
const city = ref('')
const searching = ref(false)
const row = ref('')

const CITIES = [
  'Istanbul',
  'Izmir',
  'Ankara',
  'Osaka',
  'Kyoto',
  'Sapporo',
  'Berlin',
  'Bremen',
  'Dresden',
]

/* Four thousand rows, which is where rendering all of them stops being free. */
const MANY = Array.from({ length: 4000 }, (_, index) => ({
  value: `row-${index}`,
  label: `Row ${index + 1}`,
}))

async function search(query: string) {
  if (query === '') {
    cities.value = []
    return
  }

  searching.value = true
  // The wait is the point of the demo: it is what the loading state is for.
  await new Promise((resolve) => setTimeout(resolve, 600))
  cities.value = CITIES.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map(
    (name) => ({ value: name.toLowerCase(), label: name }),
  )
  searching.value = false
}

const CODE: Record<FormPartId, string> = {
  'form-input': `<BaseInput
  v-model="email"
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="That address is already in use."
/>`,
  'form-textarea': `<BaseTextarea v-model="note" label="Note" :rows="3" />`,
  'form-field': `<FormField label="Your own control" hint="The wiring, not the input.">
  <template #default="{ id, describedBy, invalid }">
    <input :id="id" :aria-describedby="describedBy" :aria-invalid="invalid" />
  </template>
</FormField>`,
  'form-select': `<BaseSelect
  v-model="currency"
  label="Currency"
  placeholder="Choose one"
  :options="currencies"
/>`,
  'form-combobox': `<!-- One answer -->
<BaseCombobox v-model="country" label="Country" :options="countries" ... />

<!-- Several, as chips -->
<BaseCombobox
  v-model="recipients"
  mode="multiple"
  :remove-label="(name) => \`Remove \${name}\`"
  ...
/>

<!-- From a server: debounced, and do not filter it twice -->
<BaseCombobox
  :options="results"
  :loading="searching"
  loading-label="Searching…"
  filter="none"
  @search="search"
  ...
/>`,
  'form-listbox': `<BaseListbox
  v-model="access"
  mode="multiple"
  :options="people"
  label="People with access"
/>`,
  'form-checkbox': `<BaseCheckbox v-model="remember" label="Remember me" />`,
  'form-switch': `<BaseSwitch
  v-model="reminder"
  label="Daily reminder"
  hint="Every evening at 21:00"
/>`,
  'form-radio': `<BaseRadioGroup v-model="theme" legend="Theme" :options="themes" />`,
  'form-segmented': `<SegmentedControl v-model="segment" :options="segments" />`,
  'form-toggle-group': `<!-- Any number pressed at once -->
<ToggleGroup v-model="marks" mode="multiple" label="Text style" :options="marks" />

<!-- One, and never none -->
<ToggleGroup v-model="view" label="View" :options="views" required size="sm" />`,
  'form-number': `<NumberInput
  v-model="guests"
  label="Guests"
  :min="1"
  :max="12"
  decrement-label="Fewer guests"
  increment-label="More guests"
/>`,
  'form-slider': `<BaseSlider
  v-model="minutes"
  label="Session length"
  :min="5"
  :max="90"
  :step="5"
  :format="spoken"
/>`,
  'form-slider-field': `<SliderField
  v-model="opacity"
  label="Opacity"
  :min="0"
  :max="100"
  :step="5"
  decrement-label="Less opaque"
  increment-label="More opaque"
  :format="(value) => \`\${value}%\`"
/>`,
  'form-pin': `<PinInput
  v-model="code"
  :length="6"
  label="Verification code"
  :cell-label="(n, total) => \`Digit \${n} of \${total}\`"
  @complete="submit"
/>`,
  'form-tags': `<TagsInput
  v-model="tags"
  label="Tags"
  placeholder="Type and press Enter"
  :remove-label="(tag) => \`Remove \${tag}\`"
  :max="5"
/>`,
  'form-colour': `<ColorPicker
  v-model="brand"
  label="Brand colour"
  hex-label="Hex value"
  :swatches="swatches"
/>`,
  'form-file': `<FileDrop
  v-model="files"
  label="Drop a receipt here"
  browse-label="Browse"
  remove-label="Remove"
  too-large-label="That file is over 5 MB"
  accept="image/*,.pdf"
  :max-size="5 * 1024 * 1024"
  multiple
/>`,
}
</script>

<template>
  <div>
    <!-- ─────────────────── Text and choice ─────────────────── -->
    <section :id="group('form').id" class="mt-14">
      <SectionHeading :tone="NEUTRAL" :label="group('form').label" />
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        {{ group('form').lead }}
      </p>

      <article :id="part('form-input').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-input').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-input').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
            <BaseInput
              class="mt-4"
              label="Password"
              type="password"
              error="Must be at least 10 characters."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-input']" lang="html" />
        </div>
        <PropTable name="BaseInput" />
      </article>

      <article :id="part('form-textarea').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-textarea').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-textarea').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard><BaseTextarea v-model="note" label="Note" :rows="3" /></BaseCard>
          <CodeBlock :code="CODE['form-textarea']" lang="html" />
        </div>
        <PropTable name="BaseTextarea" />
      </article>

      <article :id="part('form-field').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-field').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-field').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <FormField label="Your own control" hint="FormField supplies the label and the wiring.">
              <template #default="{ id, describedBy, invalid }">
                <input
                  :id="id"
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid"
                  class="border-hair bg-surface text-ink rounded-card h-11 w-full border px-3 text-base"
                />
              </template>
            </FormField>
          </BaseCard>
          <CodeBlock :code="CODE['form-field']" lang="html" />
        </div>
        <PropTable name="FormField" />
      </article>

      <article :id="part('form-select').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-select').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-select').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseSelect
              v-model="currency"
              label="Currency"
              placeholder="Choose one"
              hint="Every amount in the report is shown in this."
              :options="CURRENCIES"
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-select']" lang="html" />
        </div>
        <PropTable name="BaseSelect" />
      </article>

      <article :id="part('form-combobox').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-combobox').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-combobox').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseCombobox
              v-model="country"
              label="Country"
              :options="COUNTRIES"
              placeholder="Type to filter"
              empty-label="No matches"
            />

            <BaseCombobox
              v-model="recipients"
              class="mt-5"
              mode="multiple"
              label="Recipients"
              :options="PEOPLE"
              :remove-label="(name) => `Remove ${name}`"
              placeholder="Add someone"
              empty-label="Nobody matches"
              hint="Choose one again to take it off; Backspace removes the last."
            />

            <BaseCombobox
              v-model="city"
              class="mt-5"
              label="City — from a server"
              :options="cities"
              :loading="searching"
              loading-label="Searching…"
              filter="none"
              placeholder="Type two letters"
              empty-label="No city matches"
              hint="The typing settles first; nothing is fetched per keystroke."
              @search="search"
            />

            <BaseCombobox
              v-model="row"
              class="mt-5"
              label="One of four thousand"
              :options="MANY"
              placeholder="Type to filter"
              empty-label="No matches"
              hint="Only the rows near the viewport are in the DOM — the arrows still walk all of it."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-combobox']" lang="html" />
        </div>
        <PropTable name="BaseCombobox" />
      </article>

      <article :id="part('form-listbox').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-listbox').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-listbox').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseListbox
              v-model="access"
              mode="multiple"
              :options="PEOPLE"
              label="People with access"
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-listbox']" lang="html" />
        </div>
        <PropTable name="BaseListbox" />
      </article>
    </section>

    <!-- ─────────────────── On, off, one of a set ─────────────────── -->
    <section :id="group('form-toggles').id" class="mt-14">
      <SectionHeading :tone="NEUTRAL" :label="group('form-toggles').label" />
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        {{ group('form-toggles').lead }}
      </p>

      <article :id="part('form-checkbox').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-checkbox').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-checkbox').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard><BaseCheckbox v-model="remember" label="Remember me" /></BaseCard>
          <CodeBlock :code="CODE['form-checkbox']" lang="html" />
        </div>
        <PropTable name="BaseCheckbox" />
      </article>

      <article :id="part('form-switch').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-switch').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-switch').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseSwitch v-model="reminder" label="Daily reminder" hint="Every evening at 21:00" />
            <p class="text-ink-soft mt-3 text-xs">
              {{ reminder ? 'Saved already — there is no Save.' : 'Off, and already saved.' }}
            </p>
          </BaseCard>
          <CodeBlock :code="CODE['form-switch']" lang="html" />
        </div>
        <PropTable name="BaseSwitch" />
      </article>

      <article :id="part('form-radio').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-radio').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-radio').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseRadioGroup v-model="themeChoice" legend="Theme" :options="THEMES" />
          </BaseCard>
          <CodeBlock :code="CODE['form-radio']" lang="html" />
        </div>
        <PropTable name="BaseRadioGroup" />
      </article>

      <article :id="part('form-segmented').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-segmented').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-segmented').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <SegmentedControl
              :options="SEGMENTS"
              :model-value="segment"
              @update:model-value="(value: string) => (segment = value)"
            />
            <p class="text-ink-soft mt-3 text-xs">Showing: {{ segment }}</p>
          </BaseCard>
          <CodeBlock :code="CODE['form-segmented']" lang="html" />
        </div>
        <PropTable name="SegmentedControl" />
      </article>

      <article :id="part('form-toggle-group').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-toggle-group').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-toggle-group').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <div class="flex flex-wrap items-center gap-4">
              <ToggleGroup v-model="marks" mode="multiple" label="Text style" :options="MARKS" />
              <ToggleGroup v-model="view" label="View" :options="VIEWS" required size="sm" />
            </div>
            <p class="text-ink-soft mt-3 text-xs">
              {{ marks.length === 0 ? 'No style' : marks.join(', ') }} · {{ view }}
            </p>
          </BaseCard>
          <CodeBlock :code="CODE['form-toggle-group']" lang="html" />
        </div>
        <PropTable name="ToggleGroup" />
      </article>
    </section>

    <!-- ─────────────────── Numbers, codes and files ─────────────────── -->
    <section :id="group('form-values').id" class="mt-14">
      <SectionHeading :tone="NEUTRAL" :label="group('form-values').label" />
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        {{ group('form-values').lead }}
      </p>

      <article :id="part('form-number').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-number').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-number').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <NumberInput
              v-model="guests"
              label="Guests"
              :min="1"
              :max="12"
              decrement-label="Fewer guests"
              increment-label="More guests"
              hint="Type it, or use the arrows and ↑ ↓"
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-number']" lang="html" />
        </div>
        <PropTable name="NumberInput" />
      </article>

      <article :id="part('form-slider').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-slider').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-slider').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <BaseSlider
              v-model="minutes"
              label="Session length"
              :min="5"
              :max="90"
              :step="5"
              :format="() => sliderText"
              hint="The arrow keys move it too."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-slider']" lang="html" />
        </div>
        <PropTable name="BaseSlider" />
      </article>

      <article :id="part('form-slider-field').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-slider-field').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-slider-field').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <SliderField
              v-model="opacity"
              label="Opacity"
              :min="0"
              :max="100"
              :step="5"
              decrement-label="Less opaque"
              increment-label="More opaque"
              :format="(value) => `${value}%`"
              hint="Drag for roughly right, type for exactly right."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-slider-field']" lang="html" />
        </div>
        <PropTable name="SliderField" />
      </article>

      <article :id="part('form-pin').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-pin').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-pin').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <p class="text-ink mb-1.5 text-sm">Verification code</p>
            <PinInput
              v-model="code"
              :length="6"
              label="Verification code"
              :cell-label="(n, total) => `Digit ${n} of ${total}`"
              @complete="toast.success(`Code ${$event} complete`)"
            />
            <p class="text-ink-soft mt-3 text-xs">Paste all six at once — they land in order.</p>
          </BaseCard>
          <CodeBlock :code="CODE['form-pin']" lang="html" />
        </div>
        <PropTable name="PinInput" />
      </article>

      <article :id="part('form-tags').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-tags').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-tags').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <TagsInput
              v-model="tags"
              label="Tags"
              placeholder="Type and press Enter"
              :remove-label="(tag) => `Remove ${tag}`"
              :max="5"
              hint="Try pasting “vue, html, css” — it becomes three."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-tags']" lang="html" />
        </div>
        <PropTable name="TagsInput" />
      </article>

      <article :id="part('form-colour').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-colour').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-colour').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <ColorPicker
              v-model="brand"
              label="Brand colour"
              hex-label="Hex value"
              :swatches="SWATCHES"
              hint="Type a short hex too — #abc becomes #aabbcc."
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-colour']" lang="html" />
        </div>
        <PropTable name="ColorPicker" />
      </article>

      <article :id="part('form-file').id" class="sc-part">
        <header class="sc-part-head">
          <h3 class="sc-part-name">{{ part('form-file').title }}</h3>
          <p class="sc-part-pitch">{{ part('form-file').pitch }}</p>
        </header>
        <div class="sc-part-row">
          <BaseCard>
            <FileDrop
              v-model="files"
              label="Drop a receipt here"
              hint="PDF or an image, up to 5 MB"
              browse-label="Browse"
              remove-label="Remove"
              too-large-label="That file is over 5 MB"
              accept="image/*,.pdf"
              :max-size="5 * 1024 * 1024"
              multiple
            />
          </BaseCard>
          <CodeBlock :code="CODE['form-file']" lang="html" />
        </div>
        <PropTable name="FileDrop" />
      </article>
    </section>
  </div>
</template>
