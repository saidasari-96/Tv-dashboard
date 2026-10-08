<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useShowsStore } from '@/stores/showsStore'
import ShowCard from '@/components/ShowCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import type { TvShow } from '@/types/show'

export default defineComponent({
  name: 'GenreShowsView',
  components: {
    ShowCard,
    LoadingSpinner,
    ErrorMessage,
  },
  props: {
    genreName: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useShowsStore, [
      'isLoading',
      'isLoadingMore',
      'hasMorePages',
      'errorMessageKey',
    ]),
    genreShows(): TvShow[] {
      const showsStore = useShowsStore()
      return showsStore.getShowsByGenre(this.genreName)
    },
  },
  watch: {
    genreName: {
      immediate: true,
      handler() {
        this.ensureShowsLoaded()
      },
    },
  },
  methods: {
    ensureShowsLoaded() {
      const showsStore = useShowsStore()
      showsStore.clearError()
      showsStore.loadDashboardShows()
    },
    onLoadMore() {
      const showsStore = useShowsStore()
      showsStore.loadMoreShows()
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
        {{ genreName }}
      </h1>
      <p class="text-ink-muted text-sm sm:text-base">
        Sorted by rating. Load More fetches the next global TVMaze show index page.
      </p>
    </header>

    <LoadingSpinner v-if="isLoading" message="Loading shows..." />

    <ErrorMessage
      v-else-if="errorMessageKey === 'errorLoadShows' && genreShows.length === 0 && !isLoadingMore"
      :message="$t(errorMessageKey)"
      show-retry
      @retry="ensureShowsLoaded"
    />

    <template v-else>
      <p
        v-if="genreShows.length === 0"
        class="rounded-2xl border border-dashed border-border bg-surface-elevated/60 px-4 py-8 text-center text-ink-muted"
      >
        No shows found for “{{ genreName }}” in the currently loaded pages.
        Try Load More to fetch additional TVMaze index pages.
      </p>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        <ShowCard
          v-for="show in genreShows"
          :key="show.id"
          :show="show"
          full-width
        />
      </div>

      <div class="flex flex-col items-center gap-3 pt-2">
        <ErrorMessage
          v-if="errorMessageKey === 'errorLoadMoreShows'"
          :message="$t(errorMessageKey)"
          show-retry
          @retry="onLoadMore"
        />

        <button
          v-if="hasMorePages"
          type="button"
          class="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoadingMore"
          @click="onLoadMore"
        >
          {{ isLoadingMore ? 'Loading more...' : 'Load More' }}
        </button>

        <p
          v-else
          class="text-sm text-ink-muted"
        >
          No more TVMaze show index pages to load.
        </p>
      </div>
    </template>
  </div>
</template>
