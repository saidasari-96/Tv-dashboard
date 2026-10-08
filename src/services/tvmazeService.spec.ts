import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SearchResult, TvShow } from '@/types/show'

const { mockGet, mockCreate } = vi.hoisted(() => {
  const mockGet = vi.fn()
  const mockCreate = vi.fn(() => ({
    get: mockGet,
  }))
  return { mockGet, mockCreate }
})

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}))

import {
  TVMAZE_API_BASE_URL,
  TVMAZE_REQUEST_TIMEOUT_MS,
  fetchShowById,
  fetchShowsByPage,
  searchShowsByName,
} from '@/services/tvmazeService'

function createMockShow(overrides: Partial<TvShow> = {}): TvShow {
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
    schedule: { time: '20:00', days: ['Monday'] },
    rating: { average: 8.1 },
    network: null,
    webChannel: null,
    summary: '<p>Summary</p>',
    image: null,
    ...overrides,
  }
}

describe('tvmazeService', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('creates an axios client with the TVMaze base URL and timeout', () => {
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: TVMAZE_API_BASE_URL,
      timeout: TVMAZE_REQUEST_TIMEOUT_MS,
    })
  })

  it('fetchShowsByPage requests /shows with the page param and returns data', async () => {
    const shows = [createMockShow({ id: 10, name: 'Page Show' })]
    mockGet.mockResolvedValue({ data: shows })

    const result = await fetchShowsByPage(2)

    expect(mockGet).toHaveBeenCalledWith('/shows', {
      params: { page: 2 },
    })
    expect(result).toEqual(shows)
  })

  it('fetchShowById requests /shows/:id and returns the show', async () => {
    const show = createMockShow({ id: 42, name: 'Detail Show' })
    mockGet.mockResolvedValue({ data: show })

    const result = await fetchShowById(42)

    expect(mockGet).toHaveBeenCalledWith('/shows/42')
    expect(result).toEqual(show)
  })

  it('searchShowsByName requests /search/shows with q and optional signal', async () => {
    const searchResults: SearchResult[] = [
      { show: createMockShow({ id: 7, name: 'Batman' }) },
    ]
    const abortController = new AbortController()
    mockGet.mockResolvedValue({ data: searchResults })

    const result = await searchShowsByName('batman', abortController.signal)

    expect(mockGet).toHaveBeenCalledWith('/search/shows', {
      params: { q: 'batman' },
      signal: abortController.signal,
    })
    expect(result).toEqual(searchResults)
  })

  it('searchShowsByName works without an AbortSignal', async () => {
    mockGet.mockResolvedValue({ data: [] })

    const result = await searchShowsByName('friends')

    expect(mockGet).toHaveBeenCalledWith('/search/shows', {
      params: { q: 'friends' },
      signal: undefined,
    })
    expect(result).toEqual([])
  })

  it('propagates API failures from fetchShowsByPage', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    await expect(fetchShowsByPage(0)).rejects.toThrow('Network error')
  })

  it('propagates AbortError from searchShowsByName when the request is cancelled', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    mockGet.mockRejectedValue(abortError)

    await expect(searchShowsByName('girls', new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
