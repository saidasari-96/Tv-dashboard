<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Loading...',
    },
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
    <div
      class="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand"
      aria-hidden="true"
    />
    <p class="text-sm text-ink-muted">{{ message }}</p>
  </div>
</template>
