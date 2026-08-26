<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import { useProjectStore } from '../store/projects'
import { useSearchStore } from '../store/search'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const searchStore = useSearchStore()
const { initialQuery } = storeToRefs(searchStore)

/** Reactive search term that mirrors route param + store fallback. */
const query = ref(initialQuery.value ?? '')
const inputRef = ref<InstanceType<typeof AppTextField> | null>(null)
/** Whether we are still running the first search after mount. */
const searching = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/** All database entities grouped by category for display. */
const results = ref<{ key: string; label: string; icon: string; items: Array<{ id: string; label: string }> }[]>([])

/** Route params to navigate when a result item is clicked. */
const categoryRoutes: Record<string, string> = {
  characters: 'character-edit',
  places: 'place-edit',
  items: 'item-edit',
  skills: 'skill-edit',
  groups: 'group-detail',
  timelines: 'timeline-detail',
  universes: 'universes',
  plots: 'plot-edit',
  scenes: 'scenes',
  stories: 'story-detail',
  chapters: 'chapter-detail',
  tasks: 'tasks',
  notes: 'note-edit',
}

/** Fallback navigation when clicking an entity without its own edit page. */
function navigateResult(category: string, id: string) {
  const routeName = categoryRoutes[category]
  if (!routeName) return
  router.push({ name: routeName, params: { id }, query: { _id: id } })
}

// ---- Search logic (name/title only) ----

/** Run a case-insensitive substring match on the query against a set of text fields. */
function matchTexts(term: string, texts: string[]): boolean {
  if (!term) return true
  const lower = term.toLowerCase()
  return texts.some((t) => t.toLowerCase().includes(lower))
}

function runSearch() {
  const term = query.value.trim()
  searching.value = true

  // Batch all reads in a single flush so Vue doesn't re-trigger during scan.
  requestAnimationFrame(() => {
    const project = projectStore.project
    if (!project) {
      results.value = []
      searching.value = false
      return
    }

    const db = project.database
    const content = project.content
    const mgmt = project.management

    const matched: Record<string, typeof results.value[number]['items']> = {}

    function push(kw: string, id: string, label: string) {
      if (!matched[kw]) matched[kw] = []
      matched[kw].push({ id, label })
    }

    // --- Database: name / title only ---
    db.characters.forEach((c) => {
      if (matchTexts(term, [c.firstName, c.lastName, ...c.aliases]))
        push('characters', c.id, `${c.firstName} ${c.lastName}`.trim())
    })
    db.places.forEach((p) => {
      if (matchTexts(term, [p.name])) push('places', p.id, p.name)
    })
    db.items.forEach((i) => {
      if (matchTexts(term, [i.name])) push('items', i.id, i.name)
    })
    db.skills.forEach((s) => {
      if (matchTexts(term, [s.name])) push('skills', s.id, s.name)
    })
    db.groups.forEach((g) => {
      if (matchTexts(term, [g.name])) push('groups', g.id, g.name)
    })
    db.timelines.forEach((t) => {
      if (matchTexts(term, [t.name])) push('timelines', t.id, t.name)
    })
    db.universes.forEach((u) => {
      if (matchTexts(term, [u.name])) push('universes', u.id, u.name)
    })
    db.plots.forEach((p) => {
      if (matchTexts(term, [p.name])) push('plots', p.id, p.name)
    })
    db.scenes.forEach((s) => {
      if (matchTexts(term, [s.title])) push('scenes', s.id, s.title)
    })

    // --- Content: story title & chapter title ---
    content.stories.forEach((s) => {
      if (matchTexts(term, [s.title])) push('stories', s.id, s.title)
    })
    content.chapters.forEach((c) => {
      if (matchTexts(term, [c.title])) push('chapters', c.id, c.title)
    })

    // --- Management: task text & note title ---
    mgmt.tasks.forEach((t) => {
      if (matchTexts(term, [t.task])) push('tasks', t.id, t.task)
    })
    mgmt.notes.forEach((n) => {
      if (matchTexts(term, [n.title])) push('notes', n.id, n.title)
    })

    // Build ordered result array
    const order = [
      { key: 'characters', label: 'Characters', icon: 'bs:people-fill' },
      { key: 'places', label: 'Places', icon: 'bs:geo-alt' },
      { key: 'items', label: 'Items', icon: 'bs:box' },
      { key: 'skills', label: 'Skills', icon: 'bs:stars' },
      { key: 'groups', label: 'Groups', icon: 'bs:collection' },
      { key: 'timelines', label: 'Timelines', icon: 'bs:clock-history' },
      { key: 'universes', label: 'Universes', icon: 'bs:globe-americas' },
      { key: 'plots', label: 'Plots', icon: 'bs:diagram-3' },
      { key: 'scenes', label: 'Scenes', icon: 'bs:film' },
      { key: 'stories', label: 'Stories', icon: 'bs:book' },
      { key: 'chapters', label: 'Chapters', icon: 'bs:book-half' },
      { key: 'tasks', label: 'Tasks', icon: 'bs:clipboard-check' },
      { key: 'notes', label: 'Notes', icon: 'bs:sticky' },
    ]

    results.value = order
      .map((cat) => ({
        ...cat,
        items: (matched[cat.key] ?? [])
          .sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .filter((cat) => cat.items.length > 0)

    // Update route query param so back-button works
    if (term) {
      router.replace({ query: { q: term } })
    } else {
      router.replace({ query: {} })
    }

    searching.value = false
  })
}

// Debounced search
watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runSearch, 200)
})

// Sync with route query param
watch(
  () => route.query.q as string,
  (newQ) => {
    if (newQ !== undefined) {
      query.value = newQ
    }
  },
)

// Auto-focus input on mount
async function focusInput() {
  await nextTick()
  const rawEl = inputRef.value?.$el?.querySelector('input') as HTMLInputElement | null
  rawEl?.focus()
}

// Kick off first search if there's an initial query from HomeView
watch(initialQuery, async (val) => {
  if (val) {
    query.value = val
    await focusInput()
  } else {
    await focusInput()
  }
}, { immediate: true })

// Cleanup
if (import.meta.env.SSR === false) {
  watch(query, (_val, _oldVal) => {
    // Clear stored initial query after first search fires
    if (searching.value === false && initialQuery.value) {
      searchStore.clearInitialQuery()
    }
  })
}
</script>

<template>
  <main class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <!-- Project not open -->
    <div v-if="!projectStore.project" class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Rapid<span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Novel</span>
      </h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">Open a project to search across everything.</p>
    </div>

    <!-- Project open -->
    <template v-else>
      <!-- Header with breadcrumb only -->
      <header class="shrink-0 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800">
        <Breadcrumb :crumbs="[{ label: 'Home', onClick: () => router.push({ name: 'home' }) }, { label: 'Search' }]" />
      </header>

      <!-- Results area -->
      <section class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <!-- Search input + results -->
        <div class="mx-auto w-full max-w-2xl mb-5">
          <!-- Big faux search input -->
          <AppTextField
            ref="inputRef"
            :model-value="query"
            placeholder="Search characters, places, stories, tasks, notes…"
            @update:model-value="query = $event"
          >
            <template #trailing>
              <span v-if="query" class="flex h-full cursor-pointer items-center px-2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200" @click="query = ''; runSearch()">
                <VueIcon name="bs:x-lg" />
              </span>
              <span v-else class="flex h-full items-center px-2 text-slate-400 dark:text-slate-500">
                <VueIcon name="bs:search" />
              </span>
            </template>
          </AppTextField>
        </div>

        <!-- Loading state -->
        <div v-if="searching" class="mx-auto flex w-full max-w-2xl items-center justify-center py-12">
          <p class="text-sm text-slate-400 dark:text-slate-500">Searching…</p>
        </div>

        <!-- Empty state (no query yet) -->
        <div v-else-if="!query.trim()" class="mx-auto flex w-full max-w-2xl flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <VueIcon name="bs:search" class="text-slate-400 dark:text-slate-500" style="width:2rem;height:2rem" />
          </div>
          <p class="text-sm text-slate-400 dark:text-slate-500">Start typing to search across your entire project</p>
        </div>

        <!-- No results found -->
        <div v-else-if="results.length === 0" class="mx-auto flex w-full max-w-2xl flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <VueIcon name="bs:emoji-frown" class="text-slate-400 dark:text-slate-500" style="width:2rem;height:2rem" />
          </div>
          <p class="font-medium text-slate-600 dark:text-slate-300">No results for "<span class="font-normal">{{ query }}</span>"</p>
        </div>

        <!-- Search results by category -->
        <div v-else class="mx-auto w-full max-w-2xl space-y-6">
          <div v-for="cat in results" :key="cat.key" class="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <!-- Category header -->
            <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
              <span class="flex items-center justify-center text-slate-500 dark:text-slate-400">
                <VueIcon :name="cat.icon" style="width:1rem;height:1rem" />
              </span>
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ cat.label }}</h3>
              <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">{{ cat.items.length }}</span>
            </div>

            <!-- Items list -->
            <ul class="p-1.5">
              <li v-for="item in cat.items" :key="item.id">
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-50 dark:hover:bg-slate-700"
                  @click="navigateResult(cat.key, item.id)"
                >
                  <span :class="{ 'truncate': item.label.length > 30 }">{{ item.label }}</span>
                  <span class="ml-auto shrink-0 text-xs text-slate-400 dark:text-slate-500">↗</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs consistently */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
