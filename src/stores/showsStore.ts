import { defineStore } from 'pinia'
import axios from 'axios'
import type { GenreGroup, SearchResult, TvShow } from '@/types/show'
import {
  fetchShowById,
  fetchShowsByPage,
  searchShowsByName,
} from '@/services/tvmazeService'
import { filterShowsByGenre, groupShowsByGenre } from '@/utils/showHelpers'

export const FAVORITES_STORAGE_KEY = 'tvshelf-favorites'
export const RECENTLY_VISITED_STORAGE_KEY = 'tvshelf-recently-visited'
export const MAX_RECENTLY_VISITED = 10

interface ShowsState {
  allShows: TvShow[]
  genreGroups: GenreGroup[]
  selectedShow: TvShow | null
  searchResults: SearchResult[]
  isLoading: boolean
  isSearching: boolean
  isLoadingMore: boolean
  errorMessageKey: string
  searchQuery: string
  hasLoadedShows: boolean
  nextPageToLoad: number
  hasMorePages: boolean
  favorites: TvShow[]
  recentlyVisited: TvShow[]
}

// merge pages without duplicates
function mergeShowsById(existingShows: TvShow[], incomingShows: TvShow[]): TvShow[] {
  const showsById = new Map<number, TvShow>()

  for (const show of existingShows) {
    showsById.set(show.id, show)
  }

  for (const show of incomingShows) {
    showsById.set(show.id, show)
  }

  return Array.from(showsById.values())
}

// active search request
let searchAbortController: AbortController | null = null

// was this search canceled?
function isSearchRequestCanceled(error: unknown, signal: AbortSignal): boolean {
  return signal.aborted || axios.isCancel(error)
}

// valid show object?
function isTvShowLike(value: unknown): value is TvShow {
  if (!value || typeof value !== 'object') {
    return false
  }

  const show = value as Partial<TvShow>
  return typeof show.id === 'number' && typeof show.name === 'string'
}

// load saved shows
function loadShowsFromStorage(storageKey: string): TvShow[] {
  try {
    const rawValue = localStorage.getItem(storageKey)
    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isTvShowLike)
  } catch {
    return []
  }
}

// persist shows list
function saveShowsToStorage(storageKey: string, shows: TvShow[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(shows))
  } catch {
    // ignore quota errors
  }
}

export const useShowsStore = defineStore('shows', {
  state: (): ShowsState => ({
    allShows: [],
    genreGroups: [],
    selectedShow: null,
    searchResults: [],
    isLoading: false,
    isSearching: false,
    isLoadingMore: false,
    errorMessageKey: '',
    searchQuery: '',
    hasLoadedShows: false,
    nextPageToLoad: 1,
    hasMorePages: true,
    favorites: loadShowsFromStorage(FAVORITES_STORAGE_KEY),
    recentlyVisited: loadShowsFromStorage(RECENTLY_VISITED_STORAGE_KEY),
  }),

  actions: {
    // first dashboard load
    async loadDashboardShows() {
      if (this.hasLoadedShows) {
        return
      }

      this.isLoading = true
      this.errorMessageKey = ''

      try {
        const firstPage = await fetchShowsByPage(0)
        this.allShows = [...firstPage]
        this.genreGroups = groupShowsByGenre(this.allShows)
        this.hasLoadedShows = true
        this.nextPageToLoad = 1
        this.hasMorePages = true
      } catch {
        this.errorMessageKey = 'errorLoadShows'
      } finally {
        this.isLoading = false
      }
    },

    // load next page
    async loadMoreShows() {
      if (this.isLoadingMore || !this.hasMorePages) {
        return
      }

      this.isLoadingMore = true
      this.errorMessageKey = ''

      try {
        const nextPageShows = await fetchShowsByPage(this.nextPageToLoad)

        if (nextPageShows.length === 0) {
          this.hasMorePages = false
          return
        }

        this.allShows = mergeShowsById(this.allShows, nextPageShows)
        this.genreGroups = groupShowsByGenre(this.allShows)
        this.nextPageToLoad += 1
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          this.hasMorePages = false
          return
        }

        this.errorMessageKey = 'errorLoadMoreShows'
      } finally {
        this.isLoadingMore = false
      }
    },

    // shows for one genre
    getShowsByGenre(genreName: string): TvShow[] {
      return filterShowsByGenre(this.allShows, genreName)
    },

    // open show details
    async loadShowDetails(showId: number) {
      this.isLoading = true
      this.errorMessageKey = ''
      this.selectedShow = null

      try {
        const showFromList = this.allShows.find((show) => show.id === showId)
        if (showFromList) {
          this.selectedShow = showFromList
        } else {
          this.selectedShow = await fetchShowById(showId)
        }

        if (this.selectedShow) {
          this.addRecentlyVisited(this.selectedShow)
        }
      } catch {
        this.errorMessageKey = 'errorLoadShowDetails'
      } finally {
        this.isLoading = false
      }
    },

    // search, cancel old request
    async searchShows(query: string) {
      const trimmedQuery = query.trim()
      this.searchQuery = trimmedQuery

      searchAbortController?.abort()
      searchAbortController = null

      if (!trimmedQuery) {
        this.searchResults = []
        this.isSearching = false
        return
      }

      const abortController = new AbortController()
      searchAbortController = abortController

      this.isSearching = true
      this.errorMessageKey = ''

      try {
        const results = await searchShowsByName(trimmedQuery, abortController.signal)

        if (searchAbortController !== abortController || abortController.signal.aborted) {
          return
        }

        this.searchResults = results
      } catch (error) {
        if (isSearchRequestCanceled(error, abortController.signal)) {
          return
        }

        if (searchAbortController !== abortController) {
          return
        }

        this.errorMessageKey = 'errorSearchFailed'
        this.searchResults = []
      } finally {
        if (searchAbortController === abortController) {
          this.isSearching = false
          searchAbortController = null
        }
      }
    },

    // clear search state
    clearSearch() {
      searchAbortController?.abort()
      searchAbortController = null
      this.searchQuery = ''
      this.searchResults = []
      this.isSearching = false
    },

    // clear error key
    clearError() {
      this.errorMessageKey = ''
    },

    // is this favorited?
    isFavorite(showId: number): boolean {
      return this.favorites.some((show) => show.id === showId)
    },

    // add to favorites
    addFavorite(show: TvShow) {
      if (this.isFavorite(show.id)) {
        return
      }

      this.favorites = [...this.favorites, show]
      saveShowsToStorage(FAVORITES_STORAGE_KEY, this.favorites)
    },

    // remove from favorites
    removeFavorite(showId: number) {
      this.favorites = this.favorites.filter((show) => show.id !== showId)
      saveShowsToStorage(FAVORITES_STORAGE_KEY, this.favorites)
    },

    // toggle favorite on/off
    toggleFavorite(show: TvShow) {
      if (this.isFavorite(show.id)) {
        this.removeFavorite(show.id)
        return
      }

      this.addFavorite(show)
    },

    // remember recent visit
    addRecentlyVisited(show: TvShow) {
      const withoutCurrentShow = this.recentlyVisited.filter(
        (visitedShow) => visitedShow.id !== show.id,
      )
      this.recentlyVisited = [show, ...withoutCurrentShow].slice(0, MAX_RECENTLY_VISITED)
      saveShowsToStorage(RECENTLY_VISITED_STORAGE_KEY, this.recentlyVisited)
    },
  },
})
