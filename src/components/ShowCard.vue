<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { TvShow } from '@/types/show'
import { formatRating } from '@/utils/showHelpers'

export default defineComponent({
  name: 'ShowCard',
  props: {
    show: {
      type: Object as PropType<TvShow>,
      required: true,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    cardWidthClass(): string {
      return this.fullWidth ? 'w-full' : 'w-36 sm:w-40'
    },
    hasRating(): boolean {
      return this.show.rating?.average !== null && this.show.rating?.average !== undefined
    },
    formattedRating(): string {
      return formatRating(this.show.rating?.average ?? null)
    },
    genreLabel(): string {
      if (!this.show.genres || this.show.genres.length === 0) {
        return 'Uncategorized'
      }
      return this.show.genres.slice(0, 2).join(' · ')
    },
  },
})
</script>

<template>
  <RouterLink
    :to="{ name: 'show-detail', params: { id: show.id } }"
    :class="cardWidthClass"
    class="group relative flex shrink-0 flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-sm ring-1 ring-border/80 transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
  >
    <div class="relative aspect-2/3 overflow-hidden bg-brand-soft">
      <img
        v-if="show.image"
        :src="show.image.medium"
        :alt="show.name"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center px-3 text-center text-sm font-medium text-brand-dark"
      >
        No image
      </div>

      <span
        v-if="hasRating"
        class="absolute right-2 top-2 rounded-lg bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-star backdrop-blur-sm"
      >
        ★ {{ formattedRating }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-0.5 p-2.5">
      <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-ink">
        {{ show.name }}
      </h3>
      <p class="truncate text-xs text-ink-muted">
        {{ genreLabel }}
      </p>
    </div>
  </RouterLink>
</template>
