import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import ShowCard from '@/components/ShowCard.vue'
import type { TvShow } from '@/types/show'

const fakeShow: TvShow = {
  id: 42,
  name: 'Under the Dome',
  type: 'Scripted',
  language: 'English',
  genres: ['Drama', 'Science-Fiction'],
  status: 'Ended',
  runtime: 60,
  premiered: '2013-06-24',
  officialSite: null,
  schedule: { time: '22:00', days: ['Thursday'] },
  rating: { average: 6.5 },
  network: null,
  webChannel: null,
  summary: '<p>A mysterious dome</p>',
  image: {
    medium: 'https://example.com/medium.jpg',
    original: 'https://example.com/original.jpg',
  },
}

async function createTestRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/show/:id', name: 'show-detail', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}

describe('ShowCard', () => {
  it('renders the show name and rating', async () => {
    const router = await createTestRouter()
    const wrapper = mount(ShowCard, {
      props: { show: fakeShow },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Under the Dome')
    expect(wrapper.text()).toContain('6.5')
    expect(wrapper.text()).toContain('Drama · Science-Fiction')
  })

  it('links to the show detail page', async () => {
    const router = await createTestRouter()
    const wrapper = mount(ShowCard, {
      props: { show: fakeShow },
      global: {
        plugins: [router],
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/show/42')
  })

  it('shows a placeholder when there is no image', async () => {
    const router = await createTestRouter()
    const showWithoutImage = { ...fakeShow, image: null }
    const wrapper = mount(ShowCard, {
      props: { show: showWithoutImage },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('No image')
  })

  it('shows Uncategorized when the show has no genres', async () => {
    const router = await createTestRouter()
    const showWithoutGenres = { ...fakeShow, genres: [] }
    const wrapper = mount(ShowCard, {
      props: { show: showWithoutGenres },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Uncategorized')
  })

  it('hides the rating when rating is null', async () => {
    const router = await createTestRouter()
    const showWithoutRating = { ...fakeShow, rating: { average: null } }
    const wrapper = mount(ShowCard, {
      props: { show: showWithoutRating },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).not.toContain('6.5')
  })

  it('renders the poster image when available', async () => {
    const router = await createTestRouter()
    const wrapper = mount(ShowCard, {
      props: { show: fakeShow },
      global: {
        plugins: [router],
      },
    })

    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('https://example.com/medium.jpg')
    expect(image.attributes('alt')).toBe('Under the Dome')
  })
})
