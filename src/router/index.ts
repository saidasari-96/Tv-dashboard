import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import ShowDetailView from '@/views/ShowDetailView.vue'
import SearchResultsView from '@/views/SearchResultsView.vue'
import GenreShowsView from '@/views/GenreShowsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/show/:id',
      name: 'show-detail',
      component: ShowDetailView,
      props: true,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchResultsView,
    },
    {
      path: '/genre/:genreName',
      name: 'genre-shows',
      component: GenreShowsView,
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
