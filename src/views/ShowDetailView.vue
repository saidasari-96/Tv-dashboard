<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useShowsStore } from '@/stores/showsStore'
import { formatRating, stripHtmlTags } from '@/utils/showHelpers'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

export default defineComponent({
  name: 'ShowDetailView',
  components: {
    LoadingSpinner,
    ErrorMessage,
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    ...mapState(useShowsStore, ['selectedShow', 'isLoading', 'errorMessageKey', 'favorites']),
    showId(): number {
      return Number(this.id)
    },
    isFavoriteShow(): boolean {
      if (!this.selectedShow) {
        return false
      }
      return this.favorites.some((show) => show.id === this.selectedShow!.id)
    },
    hasRating(): boolean {
      return this.selectedShow?.rating?.average !== null && this.selectedShow?.rating?.average !== undefined
    },
    formattedRating(): string {
      return formatRating(this.selectedShow?.rating?.average ?? null)
    },
    summaryText(): string {
      return stripHtmlTags(this.selectedShow?.summary ?? null)
    },
    networkName(): string {
      if (this.selectedShow?.network?.name) {
        return this.selectedShow.network.name
      }
      if (this.selectedShow?.webChannel?.name) {
        return this.selectedShow.webChannel.name
      }
      return 'Unknown'
    },
    scheduleText(): string {
      const schedule = this.selectedShow?.schedule
      if (!schedule) {
        return 'Not available'
      }

      const days = schedule.days && schedule.days.length > 0 ? schedule.days.join(', ') : ''
      const time = schedule.time || ''

      if (days && time) {
        return `${days} at ${time}`
      }
      if (days) {
        return days
      }
      if (time) {
        return time
      }
      return 'Not available'
    },
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.loadDetails()
      },
    },
  },
  methods: {
    loadDetails() {
      if (Number.isNaN(this.showId)) {
        return
      }
      const showsStore = useShowsStore()
      showsStore.loadShowDetails(this.showId)
    },
    onToggleFavorite() {
      if (!this.selectedShow) {
        return
      }
      const showsStore = useShowsStore()
      showsStore.toggleFavorite(this.selectedShow)
    },
  },
})
</script>

<template>
  <div>
    <LoadingSpinner v-if="isLoading" message="Loading show details..." />

    <ErrorMessage
      v-else-if="errorMessageKey === 'errorLoadShowDetails'"
      :message="$t(errorMessageKey)"
      show-retry
      @retry="loadDetails"
    />

    <article v-else-if="selectedShow" class="flex flex-col gap-6 sm:gap-8">
      <nav>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </RouterLink>
      </nav>

      <div class="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-10">
        <div class="mx-auto w-full max-w-70 lg:mx-0">
          <div class="overflow-hidden rounded-2xl bg-brand-soft shadow-md ring-1 ring-border">
            <img
              v-if="selectedShow.image"
              :src="selectedShow.image.original || selectedShow.image.medium"
              :alt="selectedShow.name"
              class="w-full object-cover"
            />
            <div
              v-else
              class="flex aspect-2/3 items-center justify-center text-brand-dark font-medium"
            >
              No image available
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <header class="flex flex-col gap-2">
            <div class="flex items-start gap-3">
              <h1 class="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
                {{ selectedShow.name }}
              </h1>
              <button
                type="button"
                class="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated shadow-sm transition hover:border-star hover:bg-star/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
                :class="isFavoriteShow ? 'text-star' : 'text-ink-muted'"
                :aria-label="isFavoriteShow ? 'Remove from favorites' : 'Add to favorites'"
                :aria-pressed="isFavoriteShow"
                @click="onToggleFavorite"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  :fill="isFavoriteShow ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9l-5.25 2.8 1-5.85L3.5 9.7l5.9-.9L12 3.5z"
                  />
                </svg>
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <span
                v-if="hasRating"
                class="inline-flex items-center gap-1 rounded-lg bg-star/15 px-2 py-1 font-semibold text-star"
              >
                ★ {{ formattedRating }}
              </span>
              <span v-if="selectedShow.premiered">{{ selectedShow.premiered.slice(0, 4) }}</span>
              <span v-if="selectedShow.status" class="rounded-md bg-brand-soft px-2 py-0.5 text-brand-dark font-medium">
                {{ selectedShow.status }}
              </span>
              <span v-if="selectedShow.runtime">{{ selectedShow.runtime }} min</span>
            </div>
          </header>

          <div v-if="selectedShow.genres.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="genre in selectedShow.genres"
              :key="genre"
              class="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink-muted"
            >
              {{ genre }}
            </span>
          </div>

          <section class="flex flex-col gap-2">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-brand">Summary</h2>
            <p class="text-ink-muted leading-relaxed">
              {{ summaryText }}
            </p>
          </section>

          <dl class="grid gap-3 sm:grid-cols-2 text-sm">
            <div class="rounded-xl bg-surface-elevated/80 ring-1 ring-border/70 px-4 py-3">
              <dt class="text-ink-muted text-xs uppercase tracking-wide">Language</dt>
              <dd class="mt-1 font-medium text-ink">{{ selectedShow.language || 'Unknown' }}</dd>
            </div>
            <div class="rounded-xl bg-surface-elevated/80 ring-1 ring-border/70 px-4 py-3">
              <dt class="text-ink-muted text-xs uppercase tracking-wide">Type</dt>
              <dd class="mt-1 font-medium text-ink">{{ selectedShow.type || 'Unknown' }}</dd>
            </div>
            <div class="rounded-xl bg-surface-elevated/80 ring-1 ring-border/70 px-4 py-3">
              <dt class="text-ink-muted text-xs uppercase tracking-wide">Network</dt>
              <dd class="mt-1 font-medium text-ink">{{ networkName }}</dd>
            </div>
            <div class="rounded-xl bg-surface-elevated/80 ring-1 ring-border/70 px-4 py-3">
              <dt class="text-ink-muted text-xs uppercase tracking-wide">Schedule</dt>
              <dd class="mt-1 font-medium text-ink">{{ scheduleText }}</dd>
            </div>
          </dl>

          <div v-if="selectedShow.officialSite" class="pt-1">
            <a
              :href="selectedShow.officialSite"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Visit official site
            </a>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
