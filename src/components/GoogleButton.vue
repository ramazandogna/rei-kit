<script setup lang="ts">
const { label } = defineProps<{ label: string }>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="border-hair bg-surface text-ink rounded-card hover:bg-muted flex h-11 w-full items-center justify-center gap-2 border text-sm font-medium transition-colors active:scale-95"
    @click="emit('click')"
  >
    <!-- Google asks for its own mark, so it is inlined rather than themed. -->
    <svg class="size-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.7 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.7 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.7z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.2a14.6 14.6 0 0 1 0-8.4l-7.8-6.1a24 24 0 0 0 0 20.6l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.3 0-11.7-4.2-13.6-10l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"
      />
    </svg>
    {{ label }}
  </button>
</template>
