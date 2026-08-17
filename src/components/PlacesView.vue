<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import { useProjectStore } from '../store/projects'
import type { Place } from '../libs/models/Place'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Search text used to filter the sidebar place list. */
const search = ref('')
/** Currently selected place's id. */
const selectedId = ref<string | null>(null)
/** Whether the inline delete confirmation is currently shown. */
const confirmDelete = ref(false)

const allPlaces = computed<Place[]>(
  () => project.value?.database.places ?? [],
)

/** Places whose name matches the search text (case-insensitive). */
const filteredPlaces = computed<Place[]>(() => {
  const term = search.value.trim().toLowerCase()
  const matched = term
    ? allPlaces.value.filter((place) => place.name.toLowerCase().includes(term))
    : allPlaces.value
  // Always keep the list sorted alphabetically by name.
  return [...matched].sort((a, b) => a.name.localeCompare(b.name))
})

const selectedPlace = computed<Place | null>(
  () => project.value?.database.places.find((p) => p.id === selectedId.value) ?? null,
)

/** The place's free-text description. */
const description = computed(() => selectedPlace.value?.description ?? '')

/** Deletes the currently selected place and closes the confirmation. */
function confirmDeletePlace() {
  if (!selectedId.value) return
  project.value?.placeService.delete(selectedId.value)
  confirmDelete.value = false
}

/** Cancels the delete confirmation and keeps the selected place. */
function cancelDelete() {
  confirmDelete.value = false
}

// Auto-select the first place when none is selected yet (or the selected
// one disappears).
watch(allPlaces, (places) => {
  if (!selectedId.value || !places.some((p) => p.id === selectedId.value)) {
    selectedId.value = places[0]?.id ?? null
    confirmDelete.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar: search + place list + New Place -->
    <aside
      class="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <header class="flex shrink-0 items-center justify-between px-4 py-3">
        <AppButton variant="text" size="sm" @click="$emit('back')">← Home</AppButton>
        <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Places
        </h2>
      </header>

      <!-- Search input at the top of the list -->
      <div class="shrink-0 px-4 pb-3">
        <AppTextField
          v-model="search"
          placeholder="Search places…"
          class="w-full"
        >
          <template #trailing>
            <span class="flex h-full items-center px-1 text-slate-400 dark:text-slate-500">
              <VueIcon name="bs:search" />
            </span>
          </template>
        </AppTextField>
      </div>

      <!-- Place list -->
      <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          v-for="place in filteredPlaces"
          :key="place.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            place.id === selectedId
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
          "
          @click="selectedId = place.id; confirmDelete = false"
        >
          <span class="font-medium">{{ place.name }}</span>
        </button>

        <p
          v-if="filteredPlaces.length === 0"
          class="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No places found.
        </p>
      </div>

      <!-- New Place button at the bottom of the list -->
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
        <AppButton variant="primary" block @click="$emit('navigate', 'place-new')">
          <VueIcon name="bs:geo-alt" />
          New Place
        </AppButton>
      </div>
    </aside>

    <!-- Main content: wiki-style place article -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <template v-if="selectedPlace">
        <div class="mx-auto w-full max-w-4xl px-8 py-8">
          <!-- Article header + edit/delete actions -->
          <div class="flex items-start justify-between gap-4">
            <h1
              class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {{ selectedPlace.name }}
            </h1>

            <!-- Top-right horizontal action menu -->
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="confirmDelete">
                <span
                  class="text-sm text-slate-500 dark:text-slate-400"
                >
                  Delete this place?
                </span>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600"
                  title="Yes, delete this place"
                  @click="confirmDeletePlace"
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
                  title="Edit place"
                  @click="$emit('navigate', 'place-edit', { id: selectedPlace.id })"
                >
                  <VueIcon name="bs:pencil-square" />
                  Edit
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                  title="Delete place"
                  @click="confirmDelete = true"
                >
                  <VueIcon name="bs:trash" />
                  Delete
                </button>
              </template>
            </div>
          </div>

          <!-- Main article content: description -->
          <article class="mt-8">
            <p
              class="whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
            >
              {{ description || 'No description yet.' }}
            </p>
          </article>
        </div>
      </template>

      <!-- Empty state when the project has no places -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No places yet. Add your first place to get started.
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
