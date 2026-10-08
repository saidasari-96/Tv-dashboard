import axios from 'axios'
import type { SearchResult, TvShow } from '@/types/show'

export const TVMAZE_API_BASE_URL = 'https://api.tvmaze.com'
export const TVMAZE_REQUEST_TIMEOUT_MS = 15000

const apiClient = axios.create({
  baseURL: TVMAZE_API_BASE_URL,
  timeout: TVMAZE_REQUEST_TIMEOUT_MS,
})

// shows by page
export async function fetchShowsByPage(pageNumber: number): Promise<TvShow[]> {
  const response = await apiClient.get<TvShow[]>(`/shows`, {
    params: { page: pageNumber },
  })
  return response.data
}

// single show detail
export async function fetchShowById(showId: number): Promise<TvShow> {
  const response = await apiClient.get<TvShow>(`/shows/${showId}`)
  return response.data
}

// search by name
export async function searchShowsByName(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const response = await apiClient.get<SearchResult[]>(`/search/shows`, {
    params: { q: query },
    signal,
  })
  return response.data
}
