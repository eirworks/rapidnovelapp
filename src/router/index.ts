import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useProjectStore } from '../store/projects'
import { menus } from '../libs/features'

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
import SkillsView from '../components/SkillsView.vue'
import SkillFormView from '../components/SkillFormView.vue'
import GroupsView from '../components/GroupsView.vue'
import GroupFormView from '../components/GroupFormView.vue'
import GroupDetailView from '../components/GroupDetailView.vue'
import TasksView from '../components/TasksView.vue'
import TimelinesView from '../components/TimelinesView.vue'
import TimelineView from '../components/TimelineView.vue'
import ReportsView from '../components/ReportsView.vue'
import QuickWriteView from '../components/QuickWriteView.vue'
import SettingsView from '../components/SettingsView.vue'
import PlotsView from '../components/PlotsView.vue'
import PlotFormView from '../components/PlotFormView.vue'
import ScenesView from '../components/ScenesView.vue'
import SceneFormView from '../components/SceneFormView.vue'
import UniversesView from '../components/UniversesView.vue'
import StoriesView from '../components/StoriesView.vue'
import StoryDetailView from '../components/StoryDetailView.vue'

/**
 * Titles shown by PlaceholderView for features that are not implemented yet.
 * Each key doubles as the route name and the Electron menu-action id, so the
 * main process menu can navigate by sending the same identifier.
 */
const placeholderTitles: Record<string, string> = {
  'save-project': 'Save Project',
  draft: 'Draft',
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
  { path: '/skills', name: 'skills', component: SkillsView },
  {
    path: '/skills/new',
    name: 'skill-new',
    component: SkillFormView,
    props: { id: 'new' },
  },
  {
    path: '/skills/:id',
    name: 'skill-edit',
    component: SkillFormView,
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
  {
    path: '/timeline/:id',
    name: 'timeline-detail',
    component: TimelineView,
    props: true,
  },
  { path: '/universes', name: 'universes', component: UniversesView },
  { path: '/story', name: 'story', component: StoriesView },
  {
    path: '/story/:id',
    name: 'story-detail',
    component: StoryDetailView,
    props: true,
  },
  { path: '/reports', name: 'reports', component: ReportsView },
  { path: '/plots', name: 'plots', component: PlotsView },
  {
    path: '/plots/new',
    name: 'plot-new',
    component: PlotFormView,
    props: { id: 'new' },
  },
  {
    path: '/plots/:id',
    name: 'plot-edit',
    component: PlotFormView,
    props: true,
  },
  { path: '/scenes', name: 'scenes', component: ScenesView },
  {
    path: '/scenes/new',
    name: 'scene-new',
    component: SceneFormView,
    props: { id: 'new' },
  },
  {
    path: '/scenes/:id',
    name: 'scene-edit',
    component: SceneFormView,
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

/**
 * Views that can only be shown while a project is open. Derived from the
 * Database / Write / Management menus in features.ts, so newly added menu
 * items are protected automatically.
 *
 * Matching uses the route's first path segment (e.g. 'characters' in
 * '/characters/:id'), which covers the form and detail sub-routes of each
 * feature as well as the top-level list views.
 */
const protectedViews = new Set(
  menus.flatMap((group) => group.items.map((item) => item.view)),
)

export const router = createRouter({
  // Hash history works both from the Vite dev server and from the file:// URL
  // used by packaged Electron builds.
  history: createWebHashHistory(),
  routes,
})

/**
 * Route guard: entering a feature page (characters, places, items, skills,
 * groups, timeline, universes, plots, scenes, draft, story, chapters, tasks,
 * reports) while no project is loaded redirects to the home view. Home, settings,
 * quick-write and the new/open project flows stay public.
 */
router.beforeEach((to) => {
  if (protectedViews.has(to.path.split('/')[1])) {
    const projectStore = useProjectStore()
    if (!projectStore.project) {
      return { name: 'home' }
    }
  }
})

export default router
