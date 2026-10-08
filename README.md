# TVShelf — TV Show Dashboard

A responsive Vue 3 dashboard that browses TV shows from the [TVMaze API](https://www.tvmaze.com/api), groups them by genre, sorts by rating, and supports search plus show details.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Vue 3 (Options API) |
| Language | TypeScript |
| Build tool | Vite |
| State | Pinia |
| Routing | Vue Router |
| Styling | Tailwind CSS 4 |
| HTTP | Axios |
| i18n | vue-i18n |
| Tests | Vitest + Vue Test Utils |

### Runtime versions

- **Node.js:** `v24.21.0` (requires `>= 20`)
- **npm:** `11.19.0` (requires `>= 10`)

## Why these choices

- **Vue 3 + Options API** — Clear component structure with `data`, `computed`, `methods`, and lifecycle hooks.
- **Vite** — Fast local development and a lightweight build setup.
- **Pinia** — Central store for loading shows, search, and selected show state.
- **Vue Router** — Routes for dashboard, show detail, and search.
- **Tailwind CSS 4** — Utility classes for a responsive UI.
- **Axios** — HTTP client for TVMaze API calls.
- **Vitest** — Unit tests for helpers, store, and components.

## Architecture

```
UI (views / components)
        ↓
Business logic (Pinia store + showHelpers)
        ↓
Data access (tvmazeService)
        ↓
External system (TVMaze API)
```

Feature flow: **view → store action → service → API**.

### Folder layout

```
src/
  components/     # Reusable UI (ShowCard, GenreRow, SearchBar, …)
  views/          # Route screens (Dashboard, Detail, Search, Genre)
  stores/         # Pinia store
  services/       # TVMaze API calls
  utils/          # Genre grouping, rating sort, HTML strip
  types/          # TypeScript models
  router/         # Route definitions
  i18n/           # English and Dutch message catalogs
```

### TVMaze data approach

TVMaze has no “shows by genre” endpoint. The dashboard loads the first **Show Index** page only (`GET /shows?page=0`), then:

1. Groups each show under its genres
2. Sorts shows in each genre by `rating.average` (highest first)
3. Orders genre rows with common genres first (Drama, Comedy, …)

Additional index pages are fetched only from a genre screen (**View All** → **Load More**), which calls `GET /shows?page=N`, appends results into the shared store list, and filters client-side by genre. There is no genre-specific TVMaze pagination endpoint.

Search uses `GET /search/shows?q=…`. Detail uses a cached show when available, otherwise `GET /shows/:id`.

## Features

- Horizontal genre rows with scroll navigation
- Shows sorted by rating
- Show detail page (summary, network, schedule, official site)
- Search by show name (debounced input; in-flight search requests canceled with AbortController)
- Favorites and recently visited shows persisted in `localStorage` via Pinia
- Genre View All page with progressive Load More of global Show Index pages
- i18n English/Dutch message configuration (`vue-i18n`; default locale `en`)
- Light/dark theme via Vue provide/inject and CSS semantic tokens
- Loading and error states with retry
- Responsive layout

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 3. Production build

```bash
npm run build
npm run preview
```

### 4. Unit tests

```bash
npm run test:run
```

Watch mode:

```bash
npm test
```

Coverage (terminal summary + HTML report in `coverage/`):

```bash
npm run test:coverage
```

Open `coverage/index.html` in a browser to view the detailed report.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run Vitest once with V8 coverage |

## Notes

- Uses the public TVMaze API over HTTPS; no API key required.
- Project is set up manually with Vite + Vue (minimal scaffolding).
