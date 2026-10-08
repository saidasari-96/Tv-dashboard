<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      required: true,
    },
    showRetry: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['retry'],
})
</script>

<template>
  <div
    class="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink"
    role="alert"
  >
    <p class="font-medium text-accent">Something went wrong</p>
    <p class="mt-1 text-ink-muted">{{ message }}</p>
    <button
      v-if="showRetry"
      type="button"
      class="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
