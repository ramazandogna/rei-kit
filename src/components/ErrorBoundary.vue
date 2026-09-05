<script setup lang="ts">
import { onErrorCaptured, ref, watch } from 'vue'

/**
 * Keeps one broken screen from taking the whole app down.
 *
 * An error thrown while a component renders unmounts the tree above it, and a
 * single-page app has nothing underneath — the tab goes white and whoever was
 * using it loses what they were in the middle of.
 *
 * What it does *not* do is decide what that looks like. All three apps in this
 * workshop had written this component, and the parts they had in common were
 * the mechanism — catch, report, reset when the route changes — while the
 * parts that differed were the ones that should: an icon, a sentence, a way
 * back. So the fallback is a slot, and the kit stays out of the wording.
 *
 * Only errors thrown while rendering a descendant reach `onErrorCaptured`.
 * Rejected promises and failed queries do not, and should not: those belong to
 * the code that owns the request.
 *
 * @example
 * ```vue
 * <ErrorBoundary :resetKey="route.fullPath" @error="reportError">
 *   <template #fallback="{ reset }">
 *     <EmptyState :title="t('error.title')">
 *       <BaseButton @click="reset">{{ t('error.retry') }}</BaseButton>
 *     </EmptyState>
 *   </template>
 *   <RouterView />
 * </ErrorBoundary>
 * ```
 */
const { resetKey } = defineProps<{
  /**
   * Clears the error whenever it changes — a route path, usually.
   *
   * An error on one screen should not follow somebody to the next one, and
   * without this the boundary stays broken until a full reload.
   */
  resetKey?: string | number | undefined
}>()

const emit = defineEmits<{ error: [cause: unknown] }>()

const failed = ref<unknown>(null)

function reset() {
  failed.value = null
}

onErrorCaptured((cause) => {
  failed.value = cause
  emit('error', cause)

  // Swallowed on purpose: the fallback is now showing, and letting it travel
  // further up would unmount the boundary along with everything else.
  return false
})

watch(
  () => resetKey,
  () => reset(),
)
</script>

<template>
  <slot v-if="failed" name="fallback" :error="failed" :reset="reset" />
  <slot v-else />
</template>
