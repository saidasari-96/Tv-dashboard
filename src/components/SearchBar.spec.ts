import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import SearchBar from '@/components/SearchBar.vue'
import { messages } from '@/i18n'

const SEARCH_DEBOUNCE_MS = 400

function createTestI18n(locale: 'en' | 'nl' = 'en') {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: 'en',
    messages,
  })
}

async function createTestRouter(initialRoute: { path?: string; name?: string; query?: Record<string, string> } = { path: '/' }) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
    ],
  })
  await router.push(initialRoute)
  await router.isReady()
  return router
}

describe('SearchBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('renders the search input with a placeholder', async () => {
    const router = await createTestRouter()
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [createPinia(), router, createTestI18n()],
      },
    })

    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Search shows by name...')
  })

  it('renders the Dutch search placeholder when locale is nl', async () => {
    const router = await createTestRouter()
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [createPinia(), router, createTestI18n('nl')],
      },
    })

    expect(wrapper.find('input[type="search"]').attributes('placeholder')).toBe(
      "Zoek programma's op naam...",
    )
  })

  it('pre-fills the input from the route query on mount', async () => {
    const router = await createTestRouter({ name: 'search', query: { q: 'friends' } })
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [createPinia(), router, createTestI18n()],
      },
    })
    await flushPromises()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('friends')
  })

  it('does not navigate when the query is empty', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(SearchBar, {
      global: {
        plugins: [pinia, router, createTestI18n()],
      },
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('navigates to the search route when a query is submitted', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(SearchBar, {
      global: {
        plugins: [pinia, router, createTestI18n()],
      },
    })

    await wrapper.find('input').setValue('breaking bad')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'breaking bad' },
    })
  })

  it('trims whitespace before navigating', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(SearchBar, {
      global: {
        plugins: [pinia, router, createTestI18n()],
      },
    })

    await wrapper.find('input').setValue('  sherlock  ')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'sherlock' },
    })
  })

  it('navigates once with the final query after the debounce period', async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(SearchBar, {
      global: {
        plugins: [pinia, router, createTestI18n()],
      },
    })

    await wrapper.find('input').setValue('b')
    await wrapper.find('input').setValue('br')
    await wrapper.find('input').setValue('breaking')

    expect(pushSpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'breaking' },
    })

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('submitting clears the pending debounce and navigates immediately', async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = await createTestRouter()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(SearchBar, {
      global: {
        plugins: [pinia, router, createTestI18n()],
      },
    })

    await wrapper.find('input').setValue('friends')
    expect(pushSpy).not.toHaveBeenCalled()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'friends' },
    })

    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)
    await flushPromises()
    expect(pushSpy).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
    wrapper.unmount()
  })
})
