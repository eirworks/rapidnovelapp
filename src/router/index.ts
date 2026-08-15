import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from '../components/HomeView.vue'
import CharactersView from '../components/CharactersView.vue'
import CharacterFormView from '../components/CharacterFormView.vue'
import LoadProjectView from '../components/LoadProjectView.vue'
import NewProjectView from '../components/NewProjectView.vue'
import PlaceholderView from '../components/PlaceholderView.vue'
import QuickWriteView from '../components/QuickWriteView.vue'
import SettingsView from '../components/SettingsView.vue'

/**
 * Titles shown by PlaceholderView for features that are not implemented yet.
 * Each key doubles as the route name and the Electron menu-action id, so the
 * main process menu can navigate by sending the same identifier.
 */
const placeholderTitles: Record<string, string> = {
  'save-project': 'Save Project',
  places: 'Places',
  items: 'Items',
  timeline: 'Timeline',
  plots: 'Plots',
  draft: 'Draft',
  story: 'Story',
  chapters: 'Chapters',
  help: 'Help',
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/quick-write', name: 'quick-write', component: QuickWriteView },
  { path: '/new-project', name: 'new-project', component: NewProjectView },
  { path: '/open-project', name: 'open-project', component: LoadProjectView },
  { path: '/characters', name: 'characters', component: CharactersView },
  {
    path: '/characters/new',
    name: 'character-new',
    component: CharacterFormView,
    props: { id: 'new' },
  },
  {
    path: '/characters/:id',
    name: 'character-edit',
    component: CharacterFormView,
    props: true,
  },
  ...Object.entries(placeholderTitles).map(
    ([name, title]): RouteRecordRaw => ({
      path: `/${name}`,
      name,
      component: PlaceholderView,
      props: { title },
    }),
  ),
  // Unknown paths fall back to Home, matching the previous behavior.
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  // Hash history works both from the Vite dev server and from the file:// URL
  // used by packaged Electron builds.
  history: createWebHashHistory(),
  routes,
})

export default router
