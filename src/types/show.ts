export interface ShowImage {
  medium: string
  original: string
}

export interface ShowRating {
  average: number | null
}

export interface ShowNetwork {
  name: string
}

export interface ShowSchedule {
  time: string
  days: string[]
}

export interface TvShow {
  id: number
  name: string
  type: string
  language: string
  genres: string[]
  status: string
  runtime: number | null
  premiered: string | null
  officialSite: string | null
  schedule: ShowSchedule
  rating: ShowRating
  network: ShowNetwork | null
  webChannel: ShowNetwork | null
  summary: string | null
  image: ShowImage | null
}

export interface SearchResult {
  show: TvShow
}

export interface GenreGroup {
  genreName: string
  shows: TvShow[]
}
