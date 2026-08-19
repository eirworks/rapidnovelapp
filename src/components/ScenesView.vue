<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import { useProjectStore } from '../store/projects'
import type { Scene } from '../libs/models/Scene'
import type { Plot } from '../libs/models/Plot'
import type { Character } from '../libs/models/Character'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Search text used to filter the sidebar scene list. */
const search = ref('')
/** Currently selected scene's id. */
const selectedId = ref<string | null>(null)
/** Whether the inline delete confirmation is currently shown. */
const confirmDelete = ref(false)

const allScenes = computed<Scene[]>(
  () => project.value?.database.scenes ?? [],
)

/** Lookup maps for referenced entities. */
const plots = computed<Map<string, Plot>>(() => {
  const map = new Map<string, Plot>()
  for (const plot of project.value?.database.plots ?? []) {
    map.set(plot.id, plot)
  }
  return map
})

const characters = computed<Map<string, Character>>(() => {
  const map = new Map<string, Character>()
  for (const c of project.value?.database.characters ?? []) {
    map.set(c.id, c)
  }
  return map
})

/** Full name of a character by id. */
function characterName(id: string): string {
  const c = characters.value.get(id)
  if (!c) return 'Unknown'
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'
}

/** Plot title by id. */
function plotTitle(id: string | null): string {
  if (!id) return ''
  return plots.value.get(id)?.name ?? 'Unknown'
}

/** Scenes whose title matches the search text (case-insensitive). */
const filteredScenes = computed<Scene[]>(() => {
  const term = search.value.trim().toLowerCase()
  const matched = term
    ? allScenes.value.filter((scene) => scene.title.toLowerCase().includes(term))
    : allScenes.value
  // Sort by number first, then alphabetically by title.
  return [...matched].sort((a, b) => {
    const numDiff = a.number - b.number
    if (numDiff !== 0) return numDiff
    return a.title.localeCompare(b.title)
  })
})

const selectedScene = computed<Scene | null>(
  () => project.value?.database.scenes.find((s) => s.id === selectedId.value) ?? null,
)

/** Deletes the currently selected scene and closes the confirmation. */
function confirmDeleteScene() {
  if (!selectedId.value) return
  project.value?.sceneService.delete(selectedId.value)
  confirmDelete.value = false
}

/** Cancels the delete confirmation and keeps the selected scene. */
function cancelDelete() {
  confirmDelete.value = false
}

// Auto-select the first scene when none is selected yet (or the selected
// one disappears).
watch(allScenes, (scenes) => {
  if (!selectedId.value || !scenes.some((s) => s.id === selectedId.value)) {
    selectedId.value = scenes[0]?.id ?? null
    confirmDelete.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar: search + scene list + New Scene -->
    <aside
      class="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <header class="flex shrink-0 items-center px-4 py-3">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Scenes' },
          ]"
        />
      </header>

      <!-- Search input at the top of the list -->
      <div class="shrink-0 px-4 pb-3">
        <AppTextField
          v-model="search"
          placeholder="Search scenes…"
          class="w-full"
        >
          <template #trailing>
            <span class="flex h-full items-center px-1 text-slate-400 dark:text-slate-500">
              <VueIcon name="bs:search" />
            </span>
          </template>
        </AppTextField>
      </div>

      <!-- Scene list -->
      <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          v-for="scene in filteredScenes"
          :key="scene.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            scene.id === selectedId
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
          "
          @click="selectedId = scene.id; confirmDelete = false"
        >
          <span class="font-medium">
            <template v-if="scene.number">#{{ scene.number }} </template>{{ scene.title }}
          </span>
          <span
            v-if="scene.plotId && plotTitle(scene.plotId)"
            class="mt-0.5 text-xs text-slate-400 dark:text-slate-500"
          >
            {{ plotTitle(scene.plotId) }}
          </span>
        </button>

        <p
          v-if="filteredScenes.length === 0"
          class="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No scenes found.
        </p>
      </div>

      <!-- New Scene button at the bottom of the list -->
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
        <AppButton variant="primary" block @click="$emit('navigate', 'scene-new')">
          <VueIcon name="bs:film" />
          New Scene
        </AppButton>
      </div>
    </aside>

    <!-- Main content: wiki-style scene article -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <template v-if="selectedScene">
        <div class="mx-auto w-full max-w-4xl px-8 py-8">
          <!-- Article header + edit/delete actions -->
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h1
                class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
              >
                <template v-if="selectedScene.number">#{{ selectedScene.number }} </template>
                {{ selectedScene.title }}
              </h1>
              <p
                v-if="selectedScene.plotId && plotTitle(selectedScene.plotId)"
                class="mt-1 text-sm text-indigo-600 dark:text-indigo-400"
              >
                {{ plotTitle(selectedScene.plotId) }}
              </p>
            </div>

            <!-- Top-right horizontal action menu -->
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="confirmDelete">
                <span
                  class="text-sm text-slate-500 dark:text-slate-400"
                >
                  Delete this scene?
                </span>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600"
                  title="Yes, delete this scene"
                  @click="confirmDeleteScene"
                >
                  Yes
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Cancel"
                  @click="cancelDelete"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
                  title="Edit scene"
                  @click="$emit('navigate', 'scene-edit', { id: selectedScene.id })"
                >
                  <VueIcon name="bs:pencil-square" />
                  Edit
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                  title="Delete scene"
                  @click="confirmDelete = true"
                >
                  <VueIcon name="bs:trash" />
                  Delete
                </button>
              </template>
            </div>
          </div>

          <!-- Main article content -->
          <article class="mt-8 space-y-8">
            <!-- Description -->
            <section>
              <h2
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                Description
              </h2>
              <p
                class="mt-2 whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
              >
                {{ selectedScene.description || 'No description yet.' }}
              </p>
            </section>

            <!-- POV Character -->
            <section v-if="selectedScene.povCharacterId">
              <h2
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                POV Character
              </h2>
              <ul class="mt-2 space-y-1">
                <li class="text-base text-slate-700 dark:text-slate-200">
                  {{ characterName(selectedScene.povCharacterId) }}
                </li>
              </ul>
            </section>
          </article>
        </div>
      </template>

      <!-- Empty state when the project has no scenes -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No scenes yet. Add your first scene to get started.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* VueIcon renders a fixed 16px svg; scale it up for the action buttons. */
.menu-action svg {
  width: 1rem;
  height: 1rem;
}
</style>
