import { createI18n } from 'vue-i18n'

export const LOCALE_STORAGE_KEY = 'tvshelf-locale'
export type AppLocale = 'en' | 'nl'

export const messages = {
  en: {
    appName: 'TVShelf',
    searchShows: 'Search TV shows',
    searchPlaceholder: 'Search shows by name...',
    browseByGenre: 'Browse by genre',
    discoverTopRated: 'Discover top-rated TV shows',
    dashboardSubtitle:
      'Explore curated rows of shows sorted by rating. Pick a title to see full details, or search by name above.',
    loadingShows: 'Loading shows...',
    favorites: 'Favorites',
    recentlyVisited: 'Recently visited',
    topRated: 'Top rated',
    language: 'Language',
    errorLoadShows: 'Could not load TV shows. Please try again later.',
    errorLoadMoreShows: 'Could not load more shows. Please try again later.',
    errorLoadShowDetails: 'Could not load show details. Please try again later.',
    errorSearchFailed: 'Search failed. Please try again later.',
  },
  nl: {
    appName: 'TVShelf',
    searchShows: "Zoek tv-programma's",
    searchPlaceholder: "Zoek programma's op naam...",
    browseByGenre: 'Blader op genre',
    discoverTopRated: "Ontdek de best beoordeelde tv-programma's",
    dashboardSubtitle:
      "Verken rijen met programma's gesorteerd op beoordeling. Kies een titel voor details, of zoek hierboven op naam.",
    loadingShows: "Programma's laden...",
    favorites: 'Favorieten',
    recentlyVisited: 'Recent bekeken',
    topRated: 'Best beoordeeld',
    language: 'Taal',
    errorLoadShows: "Kon tv-programma's niet laden. Probeer het later opnieuw.",
    errorLoadMoreShows: "Kon geen extra programma's laden. Probeer het later opnieuw.",
    errorLoadShowDetails: 'Kon programmadetails niet laden. Probeer het later opnieuw.',
    errorSearchFailed: 'Zoeken mislukt. Probeer het later opnieuw.',
  },
}

function getInitialLocale(): AppLocale {
  try {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (savedLocale === 'en' || savedLocale === 'nl') {
      return savedLocale
    }
  } catch {
    // ignore storage access errors
  }

  return 'en'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages,
})

export default i18n
