import axios from 'axios'
import type { SearchResult, TvShow } from '@/types/show'

const apiClient = axios.create({
  baseURL: 'https://api.tvmaze.com',
  timeout: 15000,
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
