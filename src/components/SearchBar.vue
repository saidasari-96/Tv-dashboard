<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'SearchBar',
})

const SEARCH_DEBOUNCE_MS = 400

const router = useRouter()
const route = useRoute()
const localQuery = ref('')
let debounceTimerId: ReturnType<typeof setTimeout> | null = null

function clearDebounceTimer() {
  if (debounceTimerId !== null) {
    clearTimeout(debounceTimerId)
    debounceTimerId = null
  }
}

function navigateToSearch() {
  const trimmedQuery = localQuery.value.trim()
  if (!trimmedQuery) {
    return
  }

  router.push({ name: 'search', query: { q: trimmedQuery } })
}

function scheduleDebouncedSearch() {
  clearDebounceTimer()
  debounceTimerId = setTimeout(() => {
    debounceTimerId = null
    navigateToSearch()
  }, SEARCH_DEBOUNCE_MS)
}

function submitSearch() {
  clearDebounceTimer()
  navigateToSearch()
}

onMounted(() => {
  const routeQuery = route.query.q
  if (typeof routeQuery === 'string') {
    localQuery.value = routeQuery
  }
})

onBeforeUnmount(() => {
  clearDebounceTimer()
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
