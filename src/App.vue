<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HomeView from './components/HomeView.vue'
import PlaceholderView from './components/PlaceholderView.vue'
import SettingsView from './components/SettingsView.vue'

type ViewId =
  | 'home'
  | 'quick-write'
  | 'new-project'
  | 'open-project'
  | 'save-project'
  | 'settings'
  | 'characters'
  | 'places'
  | 'items'
  | 'timeline'
  | 'plots'
  | 'draft'
  | 'story'
  | 'chapters'
  | 'help'
  | 'about'

const titles: Record<Exclude<ViewId, 'home'>, string> = {
  'quick-write': 'Quick Write',
  'new-project': 'New Project',
  'open-project': 'Open Project',
  'save-project': 'Save Project',
  settings: 'Settings',
  characters: 'Characters',
  places: 'Places',
  items: 'Items',
  timeline: 'Timeline',
  plots: 'Plots',
  draft: 'Draft',
  story: 'Story',
  chapters: 'Chapters',
  help: 'Help',
  about: 'About',
}

const view = ref<ViewId>('home')

function navigate(v: string) {
  if (v === 'home' || v in titles) view.value = v as ViewId
}

function onMenuAction(_event: unknown, action: string) {
  navigate(action)
}

onMounted(() => window.ipcRenderer?.on('menu-action', onMenuAction))
onBeforeUnmount(() => window.ipcRenderer?.off('menu-action', onMenuAction))
</script>

<template>
  <HomeView v-if="view === 'home'" @navigate="navigate" />
  <SettingsView v-else-if="view === 'settings'" @back="navigate('home')" />
  <PlaceholderView v-else :title="titles[view]" @back="navigate('home')" />
</template>
