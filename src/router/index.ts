import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from '../components/HomeView.vue'
import CharactersView from '../components/CharactersView.vue'
import CharacterFormView from '../components/CharacterFormView.vue'
import LoadProjectView from '../components/LoadProjectView.vue'
import NewProjectView from '../components/NewProjectView.vue'
import PlaceholderView from '../components/PlaceholderView.vue'
import PlacesView from '../components/PlacesView.vue'
import PlaceFormView from '../components/PlaceFormView.vue'
import ItemsView from '../components/ItemsView.vue'
import ItemFormView from '../components/ItemFormView.vue'
import GroupsView from '../components/GroupsView.vue'
import GroupFormView from '../components/GroupFormView.vue'
import GroupDetailView from '../components/GroupDetailView.vue'
import TasksView from '../components/TasksView.vue'
import TimelinesView from '../components/TimelinesView.vue'
import ReportsView from '../components/ReportsView.vue'
import QuickWriteView from '../components/QuickWriteView.vue'
import SettingsView from '../components/SettingsView.vue'

/**
 * Titles shown by PlaceholderView for features that are not implemented yet.
 * Each key doubles as the route name and the Electron menu-action id, so the
 * main process menu can navigate by sending the same identifier.
 */
const placeholderTitles: Record<string, string> = {
  'save-project': 'Save Project',
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
  { path: '/places', name: 'places', component: PlacesView },
  {
    path: '/places/new',
    name: 'place-new',
    component: PlaceFormView,
    props: { id: 'new' },
  },
  {
    path: '/places/:id',
    name: 'place-edit',
    component: PlaceFormView,
    props: true,
  },
  { path: '/items', name: 'items', component: ItemsView },
  {
    path: '/items/new',
    name: 'item-new',
    component: ItemFormView,
    props: { id: 'new' },
  },
  {
    path: '/items/:id',
    name: 'item-edit',
    component: ItemFormView,
    props: true,
  },
  { path: '/groups', name: 'groups', component: GroupsView },
  {
    path: '/groups/new',
    name: 'group-new',
    component: GroupFormView,
    props: { id: 'new' },
  },
  {
    path: '/groups/:id',
    name: 'group-detail',
    component: GroupDetailView,
    props: true,
  },
  {
    path: '/groups/:id/edit',
    name: 'group-edit',
    component: GroupFormView,
    props: true,
  },
  { path: '/tasks', name: 'tasks', component: TasksView },
  { path: '/timeline', name: 'timeline', component: TimelinesView },
  { path: '/reports', name: 'reports', component: ReportsView },
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
