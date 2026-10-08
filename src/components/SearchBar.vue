<script lang="ts">
import { defineComponent } from 'vue'

const SEARCH_DEBOUNCE_MS = 400

export default defineComponent({
  name: 'SearchBar',
  data() {
    return {
      localQuery: '',
      debounceTimerId: null as ReturnType<typeof setTimeout> | null,
    }
  },
  mounted() {
    const routeQuery = this.$route.query.q
    if (typeof routeQuery === 'string') {
      this.localQuery = routeQuery
    }
  },
  beforeUnmount() {
    this.clearDebounceTimer()
  },
  methods: {
    clearDebounceTimer() {
      if (this.debounceTimerId !== null) {
        clearTimeout(this.debounceTimerId)
        this.debounceTimerId = null
      }
    },
    scheduleDebouncedSearch() {
      this.clearDebounceTimer()
      this.debounceTimerId = setTimeout(() => {
        this.debounceTimerId = null
        this.navigateToSearch()
      }, SEARCH_DEBOUNCE_MS)
    },
    submitSearch() {
      this.clearDebounceTimer()
      this.navigateToSearch()
    },
    navigateToSearch() {
      const trimmedQuery = this.localQuery.trim()
      if (!trimmedQuery) {
        return
      }

      this.$router.push({ name: 'search', query: { q: trimmedQuery } })
    },
  },
})
</script>

<template>
  <form class="relative" @submit.prevent="submitSearch">
    <label for="show-search" class="sr-only">{{ $t('searchShows') }}</label>
    <input
      id="show-search"
      v-model="localQuery"
      type="search"
      :placeholder="$t('searchPlaceholder')"
      class="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/70 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      autocomplete="off"
      @input="scheduleDebouncedSearch"
    />
    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" stroke-linecap="round" />
      </svg>
    </span>
  </form>
</template>
