<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { GenreGroup } from '@/types/show'
import ShowCard from '@/components/ShowCard.vue'

export default defineComponent({
  name: 'GenreRow',
  components: {
    ShowCard,
  },
  props: {
    genreGroup: {
      type: Object as PropType<GenreGroup>,
      required: true,
    },
    showViewAll: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      canScrollLeft: false,
      canScrollRight: false,
    }
  },
  mounted() {
    this.updateScrollButtons()
    window.addEventListener('resize', this.updateScrollButtons)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateScrollButtons)
  },
  updated() {
    this.updateScrollButtons()
  },
  methods: {
    getScroller(): HTMLElement | null {
      return this.$refs.showsScroller as HTMLElement | null
    },
    scrollLeft() {
      const scroller = this.getScroller()
      if (!scroller) {
        return
      }
      scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: 'smooth' })
    },
    scrollRight() {
      const scroller = this.getScroller()
      if (!scroller) {
        return
      }
      scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' })
    },
    updateScrollButtons() {
      const scroller = this.getScroller()
      if (!scroller) {
        this.canScrollLeft = false
        this.canScrollRight = false
        return
      }

      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth
      this.canScrollLeft = scroller.scrollLeft > 2
      this.canScrollRight = scroller.scrollLeft < maxScrollLeft - 2
    },
  },
})
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-end justify-between gap-3 px-0.5">
      <div class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <h2 class="font-display text-xl sm:text-2xl font-bold text-ink">
          {{ genreGroup.genreName }}
        </h2>
        <RouterLink
          v-if="showViewAll"
          :to="{ name: 'genre-shows', params: { genreName: genreGroup.genreName } }"
          class="text-sm font-semibold text-brand hover:text-brand-dark transition shrink-0"
        >
          View All
        </RouterLink>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs sm:text-sm text-ink-muted">
          {{ genreGroup.shows.length }} shows
        </span>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-ink shadow-sm transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
            :aria-label="`Scroll ${genreGroup.genreName} shows left`"
            :disabled="!canScrollLeft"
            @click="scrollLeft"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-ink shadow-sm transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
            :aria-label="`Scroll ${genreGroup.genreName} shows right`"
            :disabled="!canScrollRight"
            @click="scrollRight"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      ref="showsScroller"
      class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      role="list"
      :aria-label="`${genreGroup.genreName} shows`"
      @scroll="updateScrollButtons"
    >
      <div
        v-for="show in genreGroup.shows"
        :key="show.id"
        class="snap-start"
        role="listitem"
      >
        <ShowCard :show="show" />
      </div>
    </div>
  </section>
</template>
