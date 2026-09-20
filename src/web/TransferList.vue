<script setup lang="ts" generic="V extends string">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseListbox from '../components/BaseListbox.vue'
import type { ListboxOption } from '../components/BaseListbox.vue'

/**
 * Two lists and the way between them: what is available, what is chosen.
 *
 * The shape people know from permissions and from building a playlist. It
 * is `BaseListbox` twice with two buttons between, which is also why the
 * keyboard works: each side is one Tab stop with arrows inside it, and the
 * buttons say how many are about to move rather than only "→".
 *
 * The chosen side keeps the order things were added in, not the order of
 * the source, because that order is usually the point.
 */
const {
  options,
  availableLabel,
  chosenLabel,
  addLabel,
  removeLabel,
  height = '14rem',
} = defineProps<{
  options: readonly ListboxOption<V>[]
  /** Heading over the left list, e.g. "Available". Already translated. */
  availableLabel: string
  /** Heading over the right list. */
  chosenLabel: string
  /** The → button's accessible name, e.g. "Add the chosen ones". */
  addLabel: string
  /** The ← button's accessible name. */
  removeLabel: string
  height?: string | undefined
}>()

/** What has been moved across, in the order it was moved. `v-model`. */
const model = defineModel<V[]>({ default: () => [] })

/* `as Ref<V[]>`: `ref` unwraps a generic array to `UnwrapRefSimple`, which
   is the same list to a reader and a different type to the compiler. */
const markedAvailable = ref([]) as Ref<V[]>
const markedChosen = ref([]) as Ref<V[]>

const available = computed(() => options.filter((option) => !model.value.includes(option.value)))
const chosen = computed(() =>
  model.value
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is ListboxOption<V> => option !== undefined),
)

function add() {
  model.value = [...model.value, ...markedAvailable.value]
  markedAvailable.value = []
}

function remove() {
  model.value = model.value.filter((value) => !markedChosen.value.includes(value))
  markedChosen.value = []
}
</script>

<template>
  <div class="rk-transfer">
    <div class="rk-transfer-side">
      <p class="rk-transfer-title">{{ availableLabel }}</p>
      <BaseListbox
        v-model="markedAvailable"
        mode="multiple"
        :options="available"
        :label="availableLabel"
        :height="height"
      />
    </div>

    <div class="rk-transfer-middle">
      <BaseButton
        icon
        variant="secondary"
        :aria-label="addLabel"
        :disabled="markedAvailable.length === 0"
        @click="add"
      >
        <ChevronRight class="size-4" />
      </BaseButton>
      <BaseButton
        icon
        variant="secondary"
        :aria-label="removeLabel"
        :disabled="markedChosen.length === 0"
        @click="remove"
      >
        <ChevronLeft class="size-4" />
      </BaseButton>
    </div>

    <div class="rk-transfer-side">
      <p class="rk-transfer-title">{{ chosenLabel }}</p>
      <BaseListbox
        v-model="markedChosen"
        mode="multiple"
        :options="chosen"
        :label="chosenLabel"
        :height="height"
      />
    </div>
  </div>
</template>

<style scoped>
.rk-transfer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
}

.rk-transfer-side {
  min-width: 0;
}

.rk-transfer-title {
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.rk-transfer-middle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* On a phone the two lists stack and the buttons turn to face them. */
@media (max-width: 40rem) {
  .rk-transfer {
    grid-template-columns: minmax(0, 1fr);
  }

  .rk-transfer-middle {
    flex-direction: row;
    justify-content: center;
    rotate: 90deg;
  }
}
</style>
