<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Plot } from '../libs/models/Plot'
import type { Place } from '../libs/models/Place'
import type { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Search text used to filter the sidebar plot list. */
const search = ref('')
/** Currently selected plot's id. */
const selectedId = ref<string | null>(null)
/** Whether the inline delete confirmation is currently shown. */
const confirmDelete = ref(false)

const allPlots = computed<Plot[]>(
  () => project.value?.database.plots ?? [],
)

/** Lookup maps for referenced entities. */
const places = computed<Map<string, Place>>(() => {
  const map = new Map<string, Place>()
  for (const place of project.value?.database.places ?? []) {
    map.set(place.id, place)
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

/** Universes available to resolve a plot's universe name. */
const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

/** Display name of the universe the selected plot belongs to, if any. */
const universeName = computed<string | null>(() => {
  const universeId = selectedPlot.value?.universeId
  if (!universeId) return null
  return universes.value.find((u) => u.id === universeId)?.name ?? null
})

/** Full name of a character by id. */
function characterName(id: string): string {
  const c = characters.value.get(id)
  if (!c) return 'Unknown'
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'
}

/** Status label (capitalised). */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  ongoing: 'Ongoing',
  completed: 'Completed',
  discard: 'Discarded',
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  ongoing:   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  discard:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

function statusBadge(plot: Plot) {
  return {
    label: STATUS_LABELS[plot.status] ?? plot.status,
    classes: STATUS_COLORS[plot.status] ?? '',
  }
}

/** Place name by id. */
function placeName(id: string | null): string {
  if (!id) return ''
  return places.value.get(id)?.name ?? 'Unknown'
}

/** Plots whose name matches the search text (case-insensitive). */
const filteredPlots = computed<Plot[]>(() => {
  const term = search.value.trim().toLowerCase()
  const matched = term
    ? allPlots.value.filter((plot) => plot.name.toLowerCase().includes(term))
    : allPlots.value
  // Sort by number, then alphabetically by name.
  return [...matched].sort((a, b) => {
    const numDiff = a.number - b.number
    if (numDiff !== 0) return numDiff
    return a.name.localeCompare(b.name)
  })
})

const selectedPlot = computed<Plot | null>(
  () => project.value?.database.plots.find((p) => p.id === selectedId.value) ?? null,
)

/** Deletes the currently selected plot and closes the confirmation. */
function confirmDeletePlot() {
  if (!selectedId.value) return
  project.value?.plotService.delete(selectedId.value)
  confirmDelete.value = false
}

/** Cancels the delete confirmation and keeps the selected plot. */
function cancelDelete() {
  confirmDelete.value = false
}

// Auto-select the first plot when none is selected yet (or the selected
// one disappears).
watch(allPlots, (plots) => {
  if (!selectedId.value || !plots.some((p) => p.id === selectedId.value)) {
    selectedId.value = plots[0]?.id ?? null
    confirmDelete.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar: search + plot list + New Plot -->
    <aside
      class="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <header class="flex shrink-0 items-center px-4 py-3">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Plots' },
          ]"
        />
      </header>

      <!-- Search input at the top of the list -->
      <div class="shrink-0 px-4 pb-3">
        <AppTextField
          v-model="search"
          placeholder="Search plots…"
          class="w-full"
        >
          <template #trailing>
            <span class="flex h-full items-center px-1 text-slate-400 dark:text-slate-500">
              <VueIcon name="bs:search" />
            </span>
          </template>
        </AppTextField>
      </div>

      <!-- Plot list -->
      <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          v-for="plot in filteredPlots"
          :key="plot.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            plot.id === selectedId
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
          "
          @click="selectedId = plot.id; confirmDelete = false"
        >
          <span class="flex items-center gap-2 font-medium">
            <template v-if="plot.number">#{{ plot.number }} </template>{{ plot.name }}
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="statusBadge(plot).classes"
            >
              {{ statusBadge(plot).label }}
            </span>
          </span>
          <span
            v-if="plot.placeId && placeName(plot.placeId)"
            class="mt-0.5 text-xs text-slate-400 dark:text-slate-500"
          >
            {{ placeName(plot.placeId) }}
          </span>
        </button>

        <p
          v-if="filteredPlots.length === 0"
          class="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No plots found.
        </p>
      </div>

      <!-- New Plot button at the bottom of the list -->
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
        <AppButton variant="primary" block @click="$emit('navigate', 'plot-new')">
          <VueIcon name="bs:diagram-3" />
          New Plot
        </AppButton>
      </div>
    </aside>

    <!-- Main content: wiki-style plot article -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <template v-if="selectedPlot">
        <div class="mx-auto w-full max-w-4xl px-8 py-8">
          <!-- Article header + edit/delete actions -->
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-start gap-3">
                <h1
                  class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                >
                  <template v-if="selectedPlot.number">#{{ selectedPlot.number }} </template>
                  {{ selectedPlot.name }}
                </h1>
                <span
                  class="shrink-0 self-center rounded-full px-3 py-1 text-sm font-medium"
                  :class="statusBadge(selectedPlot).classes"
                >
                  {{ statusBadge(selectedPlot).label }}
                </span>
              </div>
              <p
                v-if="selectedPlot.placeId && placeName(selectedPlot.placeId)"
                class="mt-1 text-sm text-indigo-600 dark:text-indigo-400"
              >
                {{ placeName(selectedPlot.placeId) }}
              </p>
              <p
                v-if="universeName"
                class="mt-1 text-sm text-emerald-600 dark:text-emerald-400"
              >
                {{ universeName }}
              </p>
            </div>

            <!-- Top-right horizontal action menu -->
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="confirmDelete">
                <span
                  class="text-sm text-slate-500 dark:text-slate-400"
                >
                  Delete this plot?
                </span>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600"
                  title="Yes, delete this plot"
                  @click="confirmDeletePlot"
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
                  title="Edit plot"
                  @click="$emit('navigate', 'plot-edit', { id: selectedPlot.id })"
                >
                  <VueIcon name="bs:pencil-square" />
                  Edit
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                  title="Delete plot"
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
                {{ selectedPlot.description || 'No description yet.' }}
              </p>
            </section>

            <!-- Goal -->
            <section>
              <h2
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                Goal
              </h2>
              <p
                class="mt-2 whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
              >
                {{ selectedPlot.goal || 'No goal defined.' }}
              </p>
            </section>

            <!-- Actors (Characters) -->
            <section v-if="selectedPlot.actorIds.length > 0">
              <h2
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                Characters
              </h2>
              <ul class="mt-2 space-y-1">
                <li
                  v-for="actorId in selectedPlot.actorIds"
                  :key="actorId"
                  class="text-base text-slate-700 dark:text-slate-200"
                >
                  {{ characterName(actorId) }}
                </li>
              </ul>
            </section>
          </article>
        </div>
      </template>

      <!-- Empty state when the project has no plots -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No plots yet. Add your first plot to get started.
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