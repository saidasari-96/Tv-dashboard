import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import { useShowsStore } from '@/stores/showsStore'
import { messages } from '@/i18n'
import type { TvShow } from '@/types/show'

function createTestI18n() {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
  })
}

function createThemeProvide(theme: 'light' | 'dark' = 'light', toggleTheme = vi.fn()) {
  return {
    themeApi: {
      theme: computed(() => theme),
      toggleTheme,
    },
  }
}

function createFakeShow(): TvShow {
  return {
    id: 1,
    name: 'Test Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    runtime: 60,
    premiered: '2020-01-01',
    officialSite: null,
    schedule: { time: '21:00', days: ['Monday'] },
    rating: { average: 8.0 },
    network: null,
    webChannel: null,
    summary: '<p>Summary</p>',
    image: null,
  }
}

async function createTestRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}

async function mountHeader(provide = createThemeProvide()) {
  const pinia = createPinia()
  const router = await createTestRouter()
  return mount(AppHeader, {
    global: {
      plugins: [pinia, router, createTestI18n()],
      provide,
    },
  })
}

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the TVShelf brand name', async () => {
    const wrapper = await mountHeader()
    expect(wrapper.text()).toContain('TVShelf')
  })

  it('links the logo to the dashboard home page', async () => {
    const wrapper = await mountHeader()
    const logoLink = wrapper.find('a')
    expect(logoLink.attributes('href')).toBe('/')
  })

  it('clears search and error state when the logo is clicked', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()

    const showsStore = useShowsStore()
    showsStore.searchQuery = 'friends'
    showsStore.searchResults = [{ show: createFakeShow() }]
    showsStore.errorMessageKey = 'errorLoadShows'

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [pinia, router, createTestI18n()],
        provide: createThemeProvide(),
      },
    })

    await wrapper.find('a').trigger('click')

    expect(showsStore.searchQuery).toBe('')
    expect(showsStore.searchResults).toEqual([])
    expect(showsStore.errorMessageKey).toBe('')
  })

  it('toggles theme from the header button', async () => {
    const toggleTheme = vi.fn()
    const wrapper = await mountHeader(createThemeProvide('light', toggleTheme))

    await wrapper.get('button[aria-label="Switch to dark theme"]').trigger('click')
    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows a light-theme label when the injected theme is dark', async () => {
    const wrapper = await mountHeader(createThemeProvide('dark'))

    expect(wrapper.find('button[aria-label="Switch to light theme"]').exists()).toBe(true)
  })
})
