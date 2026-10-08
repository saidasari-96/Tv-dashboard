import { createI18n } from 'vue-i18n'

export const messages = {
  en: {
    appName: 'TVShelf',
    searchShows: 'Search TV shows',
    searchPlaceholder: 'Search shows by name...',
    browseByGenre: 'Browse by genre',
    discoverTopRated: 'Discover top-rated TV shows',
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
    errorLoadShows: "Kon tv-programma's niet laden. Probeer het later opnieuw.",
    errorLoadMoreShows: "Kon geen extra programma's laden. Probeer het later opnieuw.",
    errorLoadShowDetails: 'Kon programmadetails niet laden. Probeer het later opnieuw.',
    errorSearchFailed: 'Zoeken mislukt. Probeer het later opnieuw.',
  },
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
