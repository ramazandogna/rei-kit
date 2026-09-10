<script setup lang="ts">
import { computed } from 'vue'
import { Download, Share } from 'lucide-vue-next'

import BaseButton from '../components/BaseButton.vue'
import { useInstall } from './use-install'
import { useSnooze } from './use-snooze'

/**
 * The card that offers to install the app, and remembers being turned down.
 *
 * Both phone apps had this, 111 lines, differing in a storage key and a colour.
 * What is here is the part that was the same: the three-way platform check, the
 * week-long snooze, and the shape.
 *
 * Every string is a prop. The kit does not know a language, and "Add to Home
 * Screen" is a sentence about a platform, not about this component.
 */
const {
  storageKey,
  title,
  body,
  action,
  later,
  iosTitle = '',
  iosBody = '',
  snoozeDays = 7,
} = defineProps<{
  /** Where the dismissal is remembered. Namespace it: `hibi-install-nudge`. */
  storageKey: string
  title: string
  body: string
  /** The install button. Not shown on iOS, which has no API to call. */
  action: string
  later: string
  /** Shown instead of `title` where the user has to use the Share menu. */
  iosTitle?: string | undefined
  iosBody?: string | undefined
  snoozeDays?: number | undefined
}>()

const { canPrompt, needsManualSteps, prompt } = useInstall()
const { isOver, snooze } = useSnooze(storageKey, snoozeDays)

const visible = computed(() => (canPrompt.value || needsManualSteps.value) && isOver.value)

async function install() {
  await prompt()

  // Accepted or dismissed, stop asking for a week. The prompt is what gets
  // tiring, not the answer.
  snooze()
}
</script>

<template>
  <Transition name="install">
    <section
      v-if="visible"
      class="border-positive/25 bg-positive/5 rounded-card flex gap-3 border p-3.5"
    >
      <span
        class="bg-positive/15 text-positive flex size-10 shrink-0 items-center justify-center rounded-xl"
        aria-hidden="true"
      >
        <component :is="needsManualSteps ? Share : Download" class="size-5" />
      </span>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p class="text-ink text-sm font-semibold">
            {{ needsManualSteps && iosTitle ? iosTitle : title }}
          </p>
          <p class="text-ink-soft mt-0.5 text-xs leading-relaxed">
            {{ needsManualSteps && iosBody ? iosBody : body }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- No button on iOS: Safari exposes no way to open the Share sheet
               from script, so a button here could only fail. -->
          <BaseButton
            v-if="canPrompt"
            variant="positive"
            pill
            size="xs"
            class="font-semibold"
            @click="install"
          >
            {{ action }}
          </BaseButton>

          <BaseButton pill size="xs" variant="quiet" @click="snooze">{{ later }}</BaseButton>
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.install-enter-active,
.install-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.install-enter-from,
.install-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .install-enter-from,
  .install-leave-to {
    transform: none;
  }
}
</style>
