<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useShowsStore } from '@/stores/showsStore'
import type { GenreGroup } from '@/types/show'
import { getTopRatedShows } from '@/utils/showHelpers'
import GenreRow from '@/components/GenreRow.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const TOP_RATED_SHOWS_LIMIT = 12

export default defineComponent({
  name: 'DashboardView',
  components: {
    GenreRow,
    LoadingSpinner,
    ErrorMessage,
  },
  computed: {
    ...mapState(useShowsStore, [
      'allShows',
      'genreGroups',
      'isLoading',
      'errorMessageKey',
      'favorites',
      'recentlyVisited',
    ]),
    favoritesGenreGroup(): GenreGroup | null {
      if (this.favorites.length === 0) {
        return null
      }
      return {
        genreName: this.$t('favorites'),
        shows: this.favorites,
      }
    },
    recentlyVisitedGenreGroup(): GenreGroup | null {
      if (this.recentlyVisited.length === 0) {
        return null
      }
      return {
        genreName: this.$t('recentlyVisited'),
        shows: this.recentlyVisited,
      }
    },
    topRatedGenreGroup(): GenreGroup | null {
      const topRatedShows = getTopRatedShows(this.allShows, TOP_RATED_SHOWS_LIMIT)
      if (topRatedShows.length === 0) {
        return null
      }
      return {
        genreName: this.$t('topRated'),
        shows: topRatedShows,
      }
    },
  },
  mounted() {
    useShowsStore().loadDashboardShows()
  },
  methods: {
    reloadShows() {
      const showsStore = useShowsStore()
      showsStore.hasLoadedShows = false
      showsStore.loadDashboardShows()
    },
  },
})
</script>

<template>
  <div class="flex flex-col gap-8 sm:gap-10">
    <header class="flex flex-col gap-2 max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-wider text-brand">
        {{ $t('browseByGenre') }}
      </p>
      <h1 class="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
        {{ $t('discoverTopRated') }}
      </h1>
      <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
        {{ $t('dashboardSubtitle') }}
      </p>
    </header>

    <LoadingSpinner v-if="isLoading" :message="$t('loadingShows')" />

    <ErrorMessage
      v-else-if="errorMessageKey === 'errorLoadShows'"
      :message="$t(errorMessageKey)"
      show-retry
      @retry="reloadShows"
    />

    <template v-else>
      <GenreRow
        v-if="favoritesGenreGroup"
        :genre-group="favoritesGenreGroup"
      />
      <GenreRow
        v-if="recentlyVisitedGenreGroup"
        :genre-group="recentlyVisitedGenreGroup"
      />
      <GenreRow
        v-if="topRatedGenreGroup"
        :genre-group="topRatedGenreGroup"
      />
      <GenreRow
        v-for="genreGroup in genreGroups"
        :key="genreGroup.genreName"
        :genre-group="genreGroup"
        show-view-all
      />
    </template>
  </div>
</template>
