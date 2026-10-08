import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { AxiosError } from 'axios'
import {
  useShowsStore,
  FAVORITES_STORAGE_KEY,
  RECENTLY_VISITED_STORAGE_KEY,
  MAX_RECENTLY_VISITED,
} from '@/stores/showsStore'
import type { TvShow } from '@/types/show'
import * as tvmazeService from '@/services/tvmazeService'

function createFakeShow(overrides: Partial<TvShow>): TvShow {
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
    summary: '<p>A great show</p>',
    image: null,
    ...overrides,
  }
}

describe('useShowsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('loads dashboard shows and builds genre groups', async () => {
    const pageZero = [
      createFakeShow({ id: 1, name: 'Show One', genres: ['Drama'], rating: { average: 9.0 } }),
      createFakeShow({ id: 2, name: 'Show Two', genres: ['Comedy'], rating: { average: 8.0 } }),
    ]

    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockResolvedValue(pageZero)

    const showsStore = useShowsStore()
    await showsStore.loadDashboardShows()

    expect(showsStore.allShows).toHaveLength(2)
    expect(tvmazeService.fetchShowsByPage).toHaveBeenCalledWith(0)
    expect(tvmazeService.fetchShowsByPage).toHaveBeenCalledTimes(1)
    expect(showsStore.genreGroups.length).toBeGreaterThan(0)
    expect(showsStore.hasLoadedShows).toBe(true)
    expect(showsStore.nextPageToLoad).toBe(1)
    expect(showsStore.hasMorePages).toBe(true)
    expect(showsStore.isLoading).toBe(false)
    expect(showsStore.errorMessageKey).toBe('')
  })

  it('sets an error message when loading shows fails', async () => {
    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockRejectedValue(new Error('Network error'))

    const showsStore = useShowsStore()
    await showsStore.loadDashboardShows()

    expect(showsStore.errorMessageKey).toBe('errorLoadShows')
    expect(showsStore.hasLoadedShows).toBe(false)
  })

  it('loads show details from the API when the show is not cached', async () => {
    const detailShow = createFakeShow({ id: 99, name: 'Detail Show' })
    vi.spyOn(tvmazeService, 'fetchShowById').mockResolvedValue(detailShow)

    const showsStore = useShowsStore()
    await showsStore.loadShowDetails(99)

    expect(showsStore.selectedShow?.name).toBe('Detail Show')
    expect(tvmazeService.fetchShowById).toHaveBeenCalledWith(99)
  })

  it('uses a cached show for details when available', async () => {
    const cachedShow = createFakeShow({ id: 5, name: 'Cached Show' })
    const fetchSpy = vi.spyOn(tvmazeService, 'fetchShowById')

    const showsStore = useShowsStore()
    showsStore.allShows = [cachedShow]
    await showsStore.loadShowDetails(5)

    expect(showsStore.selectedShow?.name).toBe('Cached Show')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('stores search results for a query', async () => {
    vi.spyOn(tvmazeService, 'searchShowsByName').mockResolvedValue([
      { show: createFakeShow({ id: 7, name: 'Breaking Bad' }) },
    ])

    const showsStore = useShowsStore()
    await showsStore.searchShows('Breaking')

    expect(showsStore.searchQuery).toBe('Breaking')
    expect(showsStore.searchResults).toHaveLength(1)
    expect(showsStore.searchResults[0]?.show.name).toBe('Breaking Bad')
  })

  it('clears search results for an empty query', async () => {
    const showsStore = useShowsStore()
    showsStore.searchResults = [{ show: createFakeShow({ id: 1 }) }]

    await showsStore.searchShows('   ')

    expect(showsStore.searchResults).toHaveLength(0)
    expect(showsStore.searchQuery).toBe('')
  })

  it('keeps newer search results when an older request finishes later', async () => {
    const batmanResults = [{ show: createFakeShow({ id: 1, name: 'Batman' }) }]
    const jokerResults = [{ show: createFakeShow({ id: 2, name: 'Joker' }) }]

    let resolveBatman!: (value: typeof batmanResults) => void
    let rejectBatman!: (reason?: unknown) => void
    const batmanPromise = new Promise<typeof batmanResults>((resolve, reject) => {
      resolveBatman = resolve
      rejectBatman = reject
    })

    vi.spyOn(tvmazeService, 'searchShowsByName').mockImplementation((query, signal) => {
      if (query === 'batman') {
        signal?.addEventListener('abort', () => {
          rejectBatman(new DOMException('Canceled', 'AbortError'))
        })
        return batmanPromise
      }

      return Promise.resolve(jokerResults)
    })

    const showsStore = useShowsStore()
    const batmanSearch = showsStore.searchShows('batman')
    const jokerSearch = showsStore.searchShows('joker')

    await jokerSearch
    expect(showsStore.searchQuery).toBe('joker')
    expect(showsStore.searchResults[0]?.show.name).toBe('Joker')
    expect(showsStore.isSearching).toBe(false)
    expect(showsStore.errorMessageKey).toBe('')

    resolveBatman(batmanResults)
    await batmanSearch

    expect(showsStore.searchQuery).toBe('joker')
    expect(showsStore.searchResults).toHaveLength(1)
    expect(showsStore.searchResults[0]?.show.name).toBe('Joker')
    expect(showsStore.errorMessageKey).toBe('')
  })

  it('does not treat an aborted search as a user-facing error', async () => {
    let rejectPending!: (reason?: unknown) => void
    const pendingPromise = new Promise<never>((_resolve, reject) => {
      rejectPending = reject
    })

    vi.spyOn(tvmazeService, 'searchShowsByName').mockImplementation((query, signal) => {
      if (query === 'batman') {
        signal?.addEventListener('abort', () => {
          rejectPending(new DOMException('Canceled', 'AbortError'))
        })
        return pendingPromise
      }

      return Promise.resolve([{ show: createFakeShow({ id: 2, name: 'Joker' }) }])
    })

    const showsStore = useShowsStore()
    const batmanSearch = showsStore.searchShows('batman')
    await showsStore.searchShows('joker')
    await batmanSearch

    expect(showsStore.errorMessageKey).toBe('')
    expect(showsStore.searchResults[0]?.show.name).toBe('Joker')
  })

  it('adds a favorite and persists it to localStorage', () => {
    const showsStore = useShowsStore()
    const show = createFakeShow({ id: 10, name: 'Favorite Show' })

    showsStore.addFavorite(show)

    expect(showsStore.favorites).toHaveLength(1)
    expect(showsStore.isFavorite(10)).toBe(true)
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')).toEqual([show])
  })

  it('removes a favorite and updates localStorage', () => {
    const showsStore = useShowsStore()
    const show = createFakeShow({ id: 11, name: 'Removable Show' })

    showsStore.addFavorite(show)
    showsStore.removeFavorite(11)

    expect(showsStore.favorites).toHaveLength(0)
    expect(showsStore.isFavorite(11)).toBe(false)
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')).toEqual([])
  })

  it('toggles a favorite on and off', () => {
    const showsStore = useShowsStore()
    const show = createFakeShow({ id: 12, name: 'Toggle Show' })

    showsStore.toggleFavorite(show)
    expect(showsStore.isFavorite(12)).toBe(true)

    showsStore.toggleFavorite(show)
    expect(showsStore.isFavorite(12)).toBe(false)
  })

  it('prevents duplicate favorites', () => {
    const showsStore = useShowsStore()
    const show = createFakeShow({ id: 13, name: 'Duplicate Show' })

    showsStore.addFavorite(show)
    showsStore.addFavorite(show)

    expect(showsStore.favorites).toHaveLength(1)
  })

  it('restores favorites from localStorage when the store initializes', () => {
    const storedFavorites = [createFakeShow({ id: 20, name: 'Stored Favorite' })]
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storedFavorites))

    setActivePinia(createPinia())
    const showsStore = useShowsStore()

    expect(showsStore.favorites).toEqual(storedFavorites)
    expect(showsStore.isFavorite(20)).toBe(true)
  })

  it('handles invalid favorites localStorage data safely', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{not-valid-json')

    setActivePinia(createPinia())
    const showsStore = useShowsStore()

    expect(showsStore.favorites).toEqual([])
  })

  it('adds recently visited shows with the newest first', () => {
    const showsStore = useShowsStore()
    const firstShow = createFakeShow({ id: 30, name: 'First' })
    const secondShow = createFakeShow({ id: 31, name: 'Second' })

    showsStore.addRecentlyVisited(firstShow)
    showsStore.addRecentlyVisited(secondShow)

    expect(showsStore.recentlyVisited.map((show) => show.id)).toEqual([31, 30])
    expect(JSON.parse(localStorage.getItem(RECENTLY_VISITED_STORAGE_KEY) || '[]')).toHaveLength(2)
  })

  it('moves an existing recently visited show to the front', () => {
    const showsStore = useShowsStore()
    const firstShow = createFakeShow({ id: 40, name: 'Alpha' })
    const secondShow = createFakeShow({ id: 41, name: 'Beta' })

    showsStore.addRecentlyVisited(firstShow)
    showsStore.addRecentlyVisited(secondShow)
    showsStore.addRecentlyVisited(firstShow)

    expect(showsStore.recentlyVisited.map((show) => show.id)).toEqual([40, 41])
  })

  it('prevents duplicate recently visited entries', () => {
    const showsStore = useShowsStore()
    const show = createFakeShow({ id: 50, name: 'Same Show' })

    showsStore.addRecentlyVisited(show)
    showsStore.addRecentlyVisited(show)

    expect(showsStore.recentlyVisited).toHaveLength(1)
  })

  it('enforces the maximum recently visited history size', () => {
    const showsStore = useShowsStore()

    for (let index = 1; index <= MAX_RECENTLY_VISITED + 3; index += 1) {
      showsStore.addRecentlyVisited(createFakeShow({ id: index, name: `Show ${index}` }))
    }

    expect(showsStore.recentlyVisited).toHaveLength(MAX_RECENTLY_VISITED)
    expect(showsStore.recentlyVisited[0]?.id).toBe(MAX_RECENTLY_VISITED + 3)
    expect(showsStore.recentlyVisited.some((show) => show.id === 1)).toBe(false)
  })

  it('restores recently visited shows after store initialization', () => {
    const storedRecent = [createFakeShow({ id: 60, name: 'Recent Show' })]
    localStorage.setItem(RECENTLY_VISITED_STORAGE_KEY, JSON.stringify(storedRecent))

    setActivePinia(createPinia())
    const showsStore = useShowsStore()

    expect(showsStore.recentlyVisited).toEqual(storedRecent)
  })

  it('records a show as recently visited when detail loading succeeds', async () => {
    const detailShow = createFakeShow({ id: 70, name: 'Detail Visit' })
    vi.spyOn(tvmazeService, 'fetchShowById').mockResolvedValue(detailShow)

    const showsStore = useShowsStore()
    await showsStore.loadShowDetails(70)

    expect(showsStore.recentlyVisited[0]?.id).toBe(70)
  })

  it('does not record recently visited when detail loading fails', async () => {
    vi.spyOn(tvmazeService, 'fetchShowById').mockRejectedValue(new Error('Network error'))

    const showsStore = useShowsStore()
    await showsStore.loadShowDetails(71)

    expect(showsStore.recentlyVisited).toHaveLength(0)
  })

  it('appends the next page of shows with loadMoreShows', async () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1, name: 'Page Zero Show' })]
    showsStore.hasLoadedShows = true
    showsStore.nextPageToLoad = 1
    showsStore.hasMorePages = true

    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockResolvedValue([
      createFakeShow({ id: 2, name: 'Page One Show', genres: ['Comedy'], rating: { average: 8.5 } }),
    ])

    await showsStore.loadMoreShows()

    expect(tvmazeService.fetchShowsByPage).toHaveBeenCalledWith(1)
    expect(showsStore.allShows).toHaveLength(2)
    expect(showsStore.nextPageToLoad).toBe(2)
    expect(showsStore.hasMorePages).toBe(true)
    expect(showsStore.genreGroups.length).toBeGreaterThan(0)
  })

  it('removes duplicate show IDs when merging pages', async () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1, name: 'Original' })]
    showsStore.nextPageToLoad = 1
    showsStore.hasMorePages = true

    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockResolvedValue([
      createFakeShow({ id: 1, name: 'Duplicate' }),
      createFakeShow({ id: 3, name: 'New Show' }),
    ])

    await showsStore.loadMoreShows()

    expect(showsStore.allShows).toHaveLength(2)
    expect(showsStore.allShows.filter((show) => show.id === 1)).toHaveLength(1)
  })

  it('sets hasMorePages to false when the next page is empty', async () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1 })]
    showsStore.nextPageToLoad = 5
    showsStore.hasMorePages = true

    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockResolvedValue([])

    await showsStore.loadMoreShows()

    expect(showsStore.hasMorePages).toBe(false)
    expect(showsStore.nextPageToLoad).toBe(5)
    expect(showsStore.allShows).toHaveLength(1)
  })

  it('sets hasMorePages to false when TVMaze returns 404 for a page', async () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1 })]
    showsStore.nextPageToLoad = 99
    showsStore.hasMorePages = true

    const notFoundError = new AxiosError('Not Found')
    notFoundError.response = {
      status: 404,
      statusText: 'Not Found',
      data: {},
      headers: {},
      config: { headers: {} as never },
    }

    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockRejectedValue(notFoundError)

    await showsStore.loadMoreShows()

    expect(showsStore.hasMorePages).toBe(false)
    expect(showsStore.errorMessageKey).toBe('')
  })

  it('keeps loaded genre groups when loadMoreShows fails', async () => {
    const pageZero = [
      createFakeShow({ id: 1, name: 'Show One', genres: ['Drama'], rating: { average: 9.0 } }),
    ]
    vi.spyOn(tvmazeService, 'fetchShowsByPage')
      .mockResolvedValueOnce(pageZero)
      .mockRejectedValueOnce(new Error('Network error'))

    const showsStore = useShowsStore()
    await showsStore.loadDashboardShows()

    expect(showsStore.hasLoadedShows).toBe(true)
    expect(showsStore.genreGroups.length).toBeGreaterThan(0)

    await showsStore.loadMoreShows()

    expect(showsStore.errorMessageKey).toBe('errorLoadMoreShows')
    expect(showsStore.allShows).toHaveLength(1)
    expect(showsStore.genreGroups.length).toBeGreaterThan(0)
    expect(showsStore.genreGroups[0]?.shows[0]?.name).toBe('Show One')
  })

  it('keeps loaded shows when searchShows fails', async () => {
    const pageZero = [
      createFakeShow({ id: 1, name: 'Show One', genres: ['Drama'], rating: { average: 9.0 } }),
    ]
    vi.spyOn(tvmazeService, 'fetchShowsByPage').mockResolvedValue(pageZero)
    vi.spyOn(tvmazeService, 'searchShowsByName').mockRejectedValue(new Error('Search down'))

    const showsStore = useShowsStore()
    await showsStore.loadDashboardShows()
    await showsStore.searchShows('batman')

    expect(showsStore.errorMessageKey).toBe('errorSearchFailed')
    expect(showsStore.searchResults).toEqual([])
    expect(showsStore.hasLoadedShows).toBe(true)
    expect(showsStore.genreGroups.length).toBeGreaterThan(0)
  })

  it('prevents concurrent loadMoreShows requests', async () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1 })]
    showsStore.nextPageToLoad = 1
    showsStore.hasMorePages = true

    let resolvePage!: (value: TvShow[]) => void
    const pendingPage = new Promise<TvShow[]>((resolve) => {
      resolvePage = resolve
    })

    const fetchSpy = vi.spyOn(tvmazeService, 'fetchShowsByPage').mockReturnValue(pendingPage)

    const firstRequest = showsStore.loadMoreShows()
    const secondRequest = showsStore.loadMoreShows()

    expect(fetchSpy).toHaveBeenCalledTimes(1)

    resolvePage([createFakeShow({ id: 2, name: 'Later Page' })])
    await Promise.all([firstRequest, secondRequest])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(showsStore.allShows).toHaveLength(2)
  })

  it('filters and sorts shows for a selected genre', () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [
      createFakeShow({ id: 1, name: 'Low Drama', genres: ['Drama'], rating: { average: 5.0 } }),
      createFakeShow({ id: 2, name: 'Comedy', genres: ['Comedy'], rating: { average: 9.0 } }),
      createFakeShow({ id: 3, name: 'High Drama', genres: ['Drama'], rating: { average: 9.0 } }),
    ]

    const dramaShows = showsStore.getShowsByGenre('Drama')

    expect(dramaShows).toHaveLength(2)
    expect(dramaShows[0]?.name).toBe('High Drama')
    expect(dramaShows[1]?.name).toBe('Low Drama')
  })

  it('returns an empty list when no loaded shows match the genre', () => {
    const showsStore = useShowsStore()
    showsStore.allShows = [createFakeShow({ id: 1, genres: ['Comedy'] })]

    expect(showsStore.getShowsByGenre('Sports')).toEqual([])
  })
})
