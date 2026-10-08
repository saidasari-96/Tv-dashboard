import { describe, it, expect } from 'vitest'
import {
  filterShowsByGenre,
  formatRating,
  getShowRating,
  groupShowsByGenre,
  sortShowsByRatingDescending,
  stripHtmlTags,
} from '@/utils/showHelpers'
import type { TvShow } from '@/types/show'

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

describe('showHelpers', () => {
  describe('getShowRating', () => {
    it('returns the average rating when available', () => {
      const show = createFakeShow({ rating: { average: 7.5 } })
      expect(getShowRating(show)).toBe(7.5)
    })

    it('returns 0 when rating is null', () => {
      const show = createFakeShow({ rating: { average: null } })
      expect(getShowRating(show)).toBe(0)
    })
  })

  describe('sortShowsByRatingDescending', () => {
    it('sorts shows from highest to lowest rating', () => {
      const shows = [
        createFakeShow({ id: 1, name: 'Low', rating: { average: 5.0 } }),
        createFakeShow({ id: 2, name: 'High', rating: { average: 9.0 } }),
        createFakeShow({ id: 3, name: 'Mid', rating: { average: 7.0 } }),
      ]

      const sortedShows = sortShowsByRatingDescending(shows)

      expect(sortedShows[0]?.name).toBe('High')
      expect(sortedShows[1]?.name).toBe('Mid')
      expect(sortedShows[2]?.name).toBe('Low')
    })
  })

  describe('filterShowsByGenre', () => {
    it('filters shows by the selected genre and sorts by rating', () => {
      const shows = [
        createFakeShow({ id: 1, name: 'Low Drama', genres: ['Drama'], rating: { average: 6.0 } }),
        createFakeShow({ id: 2, name: 'Comedy Hit', genres: ['Comedy'], rating: { average: 9.0 } }),
        createFakeShow({ id: 3, name: 'High Drama', genres: ['Drama'], rating: { average: 9.5 } }),
      ]

      const dramaShows = filterShowsByGenre(shows, 'Drama')

      expect(dramaShows).toHaveLength(2)
      expect(dramaShows[0]?.name).toBe('High Drama')
      expect(dramaShows[1]?.name).toBe('Low Drama')
    })

    it('returns an empty list when no shows match the genre', () => {
      const shows = [createFakeShow({ id: 1, genres: ['Comedy'] })]
      expect(filterShowsByGenre(shows, 'Sports')).toEqual([])
    })
  })

  describe('groupShowsByGenre', () => {
    it('groups shows under each of their genres', () => {
      const shows = [
        createFakeShow({ id: 1, name: 'Drama Hit', genres: ['Drama'], rating: { average: 9.0 } }),
        createFakeShow({ id: 2, name: 'Funny Show', genres: ['Comedy'], rating: { average: 8.0 } }),
        createFakeShow({
          id: 3,
          name: 'Action Drama',
          genres: ['Action', 'Drama'],
          rating: { average: 7.0 },
        }),
      ]

      const genreGroups = groupShowsByGenre(shows)

      const dramaGroup = genreGroups.find((group) => group.genreName === 'Drama')
      const comedyGroup = genreGroups.find((group) => group.genreName === 'Comedy')
      const actionGroup = genreGroups.find((group) => group.genreName === 'Action')

      expect(dramaGroup).toBeDefined()
      expect(comedyGroup).toBeDefined()
      expect(actionGroup).toBeDefined()
      expect(dramaGroup!.shows).toHaveLength(2)
      expect(comedyGroup!.shows).toHaveLength(1)
      expect(actionGroup!.shows).toHaveLength(1)
    })

    it('places shows without genres into Other', () => {
      const shows = [createFakeShow({ id: 10, genres: [], rating: { average: 6.0 } })]
      const genreGroups = groupShowsByGenre(shows)

      expect(genreGroups).toHaveLength(1)
      expect(genreGroups[0]?.genreName).toBe('Other')
    })

    it('sorts shows inside each genre by rating', () => {
      const shows = [
        createFakeShow({ id: 1, name: 'B', genres: ['Comedy'], rating: { average: 6.0 } }),
        createFakeShow({ id: 2, name: 'A', genres: ['Comedy'], rating: { average: 9.5 } }),
      ]

      const genreGroups = groupShowsByGenre(shows)
      const comedyGroup = genreGroups.find((group) => group.genreName === 'Comedy')

      expect(comedyGroup?.shows[0]?.name).toBe('A')
      expect(comedyGroup?.shows[1]?.name).toBe('B')
    })
  })

  describe('stripHtmlTags', () => {
    it('removes HTML tags from summary text', () => {
      expect(stripHtmlTags('<p>Hello <b>world</b></p>')).toBe('Hello world')
    })

    it('returns a fallback message for empty summaries', () => {
      expect(stripHtmlTags(null)).toBe('No summary available.')
    })
  })

  describe('formatRating', () => {
    it('formats a rating to one decimal place', () => {
      expect(formatRating(8)).toBe('8.0')
      expect(formatRating(7.5)).toBe('7.5')
    })

    it('returns N/A for null ratings', () => {
      expect(formatRating(null)).toBe('N/A')
    })
  })
})
