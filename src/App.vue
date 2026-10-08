<script lang="ts">
import { computed, defineComponent } from 'vue'
import AppHeader from '@/components/AppHeader.vue'

export default defineComponent({
  name: 'App',
  components: {
    AppHeader,
  },
  data() {
    return {
      theme: 'light' as 'light' | 'dark',
    }
  },
  provide() {
    return {
      themeApi: {
        theme: computed(() => this.theme),
        toggleTheme: () => {
          this.toggleTheme()
        },
      },
    }
  },
  watch: {
    theme: {
      immediate: true,
      handler(themeMode: 'light' | 'dark') {
        document.documentElement.classList.toggle('dark', themeMode === 'dark')
      },
    },
  },
  beforeUnmount() {
    document.documentElement.classList.remove('dark')
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
  },
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <RouterView />
    </main>
    <footer class="border-t border-border/60 py-4 text-center text-sm text-ink-muted">
      &copy; {{ new Date().getFullYear() }} TVShelf. All rights reserved.
    </footer>
  </div>
</template>
