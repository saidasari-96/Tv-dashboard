import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import GenreRow from '@/components/GenreRow.vue'
import ShowCard from '@/components/ShowCard.vue'
import type { GenreGroup, TvShow } from '@/types/show'

function createFakeShow(overrides: Partial<TvShow> = {}): TvShow {
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
    ...overrides,
  }
}

async function createTestRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/show/:id', name: 'show-detail', component: { template: '<div />' } },
      { path: '/genre/:genreName', name: 'genre-shows', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}

describe('GenreRow', () => {
  const genreGroup: GenreGroup = {
    genreName: 'Drama',
    shows: [
      createFakeShow({ id: 1, name: 'Breaking Bad' }),
      createFakeShow({ id: 2, name: 'The Wire' }),
    ],
  }

  it('renders the genre name and show count', async () => {
    const router = await createTestRouter()
    const wrapper = mount(GenreRow, {
      props: { genreGroup },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Drama')
    expect(wrapper.text()).toContain('2 shows')
  })

  it('renders a ShowCard for each show', async () => {
    const router = await createTestRouter()
    const wrapper = mount(GenreRow, {
      props: { genreGroup },
      global: {
        plugins: [router],
      },
    })

    const showCards = wrapper.findAllComponents(ShowCard)
    expect(showCards).toHaveLength(2)
    expect(wrapper.text()).toContain('Breaking Bad')
    expect(wrapper.text()).toContain('The Wire')
  })

  it('renders left and right scroll navigation buttons', async () => {
    const router = await createTestRouter()
    const wrapper = mount(GenreRow, {
      props: { genreGroup },
      global: {
        plugins: [router],
      },
    })

    const leftButton = wrapper.find('button[aria-label="Scroll Drama shows left"]')
    const rightButton = wrapper.find('button[aria-label="Scroll Drama shows right"]')

    expect(leftButton.exists()).toBe(true)
    expect(rightButton.exists()).toBe(true)
  })

  it('does not render View All by default', async () => {
    const router = await createTestRouter()
    const wrapper = mount(GenreRow, {
      props: { genreGroup },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).not.toContain('View All')
  })

  it('links View All to the genre page when enabled', async () => {
    const router = await createTestRouter()
    const wrapper = mount(GenreRow, {
      props: { genreGroup, showViewAll: true },
      global: {
        plugins: [router],
      },
    })

    const viewAllLink = wrapper.findAll('a').find((link) => link.text() === 'View All')
    expect(viewAllLink).toBeDefined()
    expect(viewAllLink?.attributes('href')).toBe('/genre/Drama')
  })

})
