<script lang="ts">
import { computed, defineComponent, type ComputedRef } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import { useShowsStore } from '@/stores/showsStore'

type ThemeMode = 'light' | 'dark'

interface ThemeApi {
  theme: ComputedRef<ThemeMode>
  toggleTheme: () => void
}

function createDefaultThemeApi(): ThemeApi {
  return {
    theme: computed(() => 'light' as ThemeMode),
    toggleTheme: () => undefined,
  }
}

export default defineComponent({
  name: 'AppHeader',
  components: {
    SearchBar,
  },
  inject: {
    themeApi: {
      from: 'themeApi',
      default: createDefaultThemeApi,
    },
  },
  computed: {
    currentTheme(): ThemeMode {
      return (this.themeApi as ThemeApi).theme.value
    },
    themeToggleLabel(): string {
      return this.currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    },
  },
  methods: {
    onLogoClick() {
      const showsStore = useShowsStore()
      showsStore.clearSearch()
      showsStore.clearError()
    },
    onToggleTheme() {
      ;(this.themeApi as ThemeApi).toggleTheme()
    },
  },
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/70 bg-surface/85 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <RouterLink
        to="/"
        class="group flex items-center gap-2.5 shrink-0"
        @click="onLogoClick"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8" stroke-linecap="round" />
          </svg>
        </span>
        <span class="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
          {{ $t('appName') }}
        </span>
      </RouterLink>

      <div class="flex w-full sm:max-w-md items-center gap-2">
        <SearchBar class="min-w-0 flex-1" />
        <button
          type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated text-ink shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
          :aria-label="themeToggleLabel"
          :aria-pressed="currentTheme === 'dark'"
          @click="onToggleTheme"
        >
          <svg
            v-if="currentTheme === 'dark'"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              stroke-linecap="round"
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
