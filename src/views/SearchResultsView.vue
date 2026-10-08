<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useShowsStore } from '@/stores/showsStore'
import ShowCard from '@/components/ShowCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

export default defineComponent({
  name: 'SearchResultsView',
  components: {
    ShowCard,
    LoadingSpinner,
    ErrorMessage,
  },
  computed: {
    ...mapState(useShowsStore, ['searchResults', 'isSearching', 'errorMessageKey', 'searchQuery']),
  },
  watch: {
    '$route.query.q': {
      immediate: true,
      handler(newQuery: unknown) {
        if (typeof newQuery === 'string' && newQuery.trim()) {
          this.runSearch(newQuery)
        }
      },
    },
  },
  methods: {
    runSearch(query?: string) {
      let searchQuery = this.searchQuery

      if (typeof query === 'string') {
        searchQuery = query
      } else if (typeof this.$route.query.q === 'string') {
        searchQuery = this.$route.query.q
      }

      useShowsStore().searchShows(searchQuery)
    },
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <nav>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition"
      >
        <span aria-hidden="true">←</span>
        Back to dashboard
      </RouterLink>
    </nav>

    <header class="flex flex-col gap-1">
      <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink">
        Search results
      </h1>
      <p v-if="searchQuery" class="text-ink-muted text-sm sm:text-base">
        Showing matches for “{{ searchQuery }}”
      </p>
    </header>

    <LoadingSpinner v-if="isSearching" message="Searching shows..." />

    <ErrorMessage
      v-else-if="errorMessageKey === 'errorSearchFailed'"
      :message="$t(errorMessageKey)"
      show-retry
      @retry="runSearch"
    />

    <p
      v-else-if="!searchQuery"
      class="rounded-2xl border border-dashed border-border bg-surface-elevated/60 px-4 py-8 text-center text-ink-muted"
    >
      Type a show name in the search bar to get started.
    </p>

    <p
      v-else-if="searchResults.length === 0"
      class="rounded-2xl border border-dashed border-border bg-surface-elevated/60 px-4 py-8 text-center text-ink-muted"
    >
      No shows found for “{{ searchQuery }}”. Try a different name.
    </p>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      <ShowCard
        v-for="result in searchResults"
        :key="result.show.id"
        :show="result.show"
        full-width
      />
    </div>
  </div>
</template>
