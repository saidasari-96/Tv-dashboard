import type { GenreGroup, TvShow } from '@/types/show'

// preferred genre order
const PRIORITY_GENRES = [
  'Drama',
  'Comedy',
  'Action',
  'Thriller',
  'Crime',
  'Science-Fiction',
  'Horror',
  'Romance',
  'Adventure',
  'Fantasy',
  'Sports',
  'Family',
  'Anime',
  'Mystery',
]

// genres list for show
function getShowGenreNames(show: TvShow): string[] {
  if (show.genres && show.genres.length > 0) {
    return show.genres
  }
  return ['Other']
}

// remove duplicate shows
function removeDuplicateShows(shows: TvShow[]): TvShow[] {
  const seenIds = new Set<number>()
  const uniqueShows: TvShow[] = []

  for (const show of shows) {
    if (!seenIds.has(show.id)) {
      seenIds.add(show.id)
      uniqueShows.push(show)
    }
  }

  return uniqueShows
}

// sort genre row order
function sortGenreGroups(genreGroups: GenreGroup[]): GenreGroup[] {
  const sortedGroups = [...genreGroups]

  sortedGroups.sort((firstGroup, secondGroup) => {
    const firstPriority = PRIORITY_GENRES.indexOf(firstGroup.genreName)
    const secondPriority = PRIORITY_GENRES.indexOf(secondGroup.genreName)

    const firstRank = firstPriority === -1 ? PRIORITY_GENRES.length : firstPriority
    const secondRank = secondPriority === -1 ? PRIORITY_GENRES.length : secondPriority

    if (firstRank !== secondRank) {
      return firstRank - secondRank
    }

    return firstGroup.genreName.localeCompare(secondGroup.genreName)
  })

  return sortedGroups
}

// get average rating
export function getShowRating(show: TvShow): number {
  if (show.rating && show.rating.average !== null) {
    return show.rating.average
  }
  return 0
}

// sort by rating desc
export function sortShowsByRatingDescending(shows: TvShow[]): TvShow[] {
  const sortedShows = [...shows]
  sortedShows.sort((firstShow, secondShow) => {
    return getShowRating(secondShow) - getShowRating(firstShow)
  })
  return sortedShows
}

// filter and sort genre
export function filterShowsByGenre(shows: TvShow[], genreName: string): TvShow[] {
  const matchingShows = shows.filter((show) => getShowGenreNames(show).includes(genreName))
  const uniqueShows = removeDuplicateShows(matchingShows)
  return sortShowsByRatingDescending(uniqueShows)
}

// build genre rows
export function groupShowsByGenre(shows: TvShow[]): GenreGroup[] {
  const showsByGenre = new Map<string, TvShow[]>()

  for (const show of shows) {
    const genres = getShowGenreNames(show)

    for (const genreName of genres) {
      const existingShows = showsByGenre.get(genreName)
      if (existingShows) {
        existingShows.push(show)
      } else {
        showsByGenre.set(genreName, [show])
      }
    }
  }

  const genreGroups: GenreGroup[] = []

  for (const [genreName, genreShows] of showsByGenre.entries()) {
    const uniqueShows = removeDuplicateShows(genreShows)
    const sortedShows = sortShowsByRatingDescending(uniqueShows)
    genreGroups.push({
      genreName,
      shows: sortedShows,
    })
  }

  return sortGenreGroups(genreGroups)
}

// strip html from summary
export function stripHtmlTags(htmlText: string | null): string {
  if (!htmlText) {
    return 'No summary available.'
  }
  return htmlText.replace(/<[^>]*>/g, '').trim()
}

// format rating display
export function formatRating(rating: number | null): string {
  if (rating === null) {
    return 'N/A'
  }
  return rating.toFixed(1)
}
