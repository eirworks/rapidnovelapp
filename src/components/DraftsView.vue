<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Story } from '../libs/models/Story'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

/**
 * Lists every draft of the open project. Drafts are stored on disk in the
 * project's `projects/<id>/drafts/<draftId>.json` folder and read through
 * `window.draftApi` — they are not part of the in-memory project graph.
 */
defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const stories = computed<Story[]>(() => project.value?.content.stories ?? [])
const hasStories = computed(() => stories.value.length > 0)

const drafts = ref<DraftSummary[]>([])
const loading = ref(true)
const busyId = ref<string | null>(null)
const error = ref('')

const projectId = computed(() => project.value?.id ?? '')

async function loadDrafts() {
  loading.value = true
  error.value = ''
  try {
    drafts.value = await window.draftApi.list(projectId.value)
  } catch {
    error.value = 'Could not load drafts.'
    drafts.value = []
  } finally {
    loading.value = false
  }
}

/** Display name of the draft's story, or null when unassigned/missing. */
function storyName(storyId: string | null): string | null {
  if (!storyId) return null
  return stories.value.find((s) => s.id === storyId)?.title ?? null
}

/** Human-readable last-modified date for the card footer. */
function dateLabel(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
}

async function removeDraft(draft: DraftSummary) {
  if (!window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) return
  busyId.value = draft.id
  error.value = ''
  try {
    await window.draftApi.delete(projectId.value, draft.id)
    await loadDrafts()
  } catch {
    error.value = 'Could not delete the draft.'
  } finally {
    busyId.value = null
  }
}

onMounted(loadDrafts)
</script>

<template>
  <main
    class="flex min-h-screen flex-col bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50"
  >
    <div class="mx-auto w-full max-w-4xl">
      <div class="flex items-center justify-between gap-4">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Drafts' },
          ]"
        />

        <AppButton variant="primary" size="sm" @click="$emit('navigate', 'draft-new')" :disabled="!hasStories" :title="!hasStories ? 'You need to create a story first' : undefined">
          New Draft
        </AppButton>
      </div>

      <!-- Full-width cards -->
      <div v-if="loading" class="mt-16 text-center text-sm text-slate-500 dark:text-slate-400">
        Loading drafts…
      </div>

      <div v-else class="mt-8 flex flex-col gap-4">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
          role="button"
          tabindex="0"
          @click="$emit('navigate', 'draft-edit', { id: draft.id })"
          @keydown.enter="$emit('navigate', 'draft-edit', { id: draft.id })"
          @keydown.space.prevent="$emit('navigate', 'draft-edit', { id: draft.id })"
        >
          <!-- Gradient box with the pencil icon -->
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
            title="Draft"
          >
            <VueIcon name="bs:pencil" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p
                class="min-w-0 truncate font-semibold text-slate-900 dark:text-slate-50"
                :title="draft.title"
              >
                {{ draft.title || 'Untitled' }}
              </p>
              <!-- Story badge -->
              <span
                v-if="storyName(draft.storyId)"
                class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                :title="`Story: ${storyName(draft.storyId)}`"
              >
                {{ storyName(draft.storyId) }}
              </span>
              <span
                v-else
                class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                title="No story assigned yet"
              >
                No story
              </span>
            </div>

            <p class="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
              Edited {{ dateLabel(draft.updatedAt) }}
            </p>
          </div>

          <!-- Delete action; the card itself opens the editor -->
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
            title="Delete draft"
            :disabled="busyId === draft.id"
            @click.stop="removeDraft(draft)"
          >
            <VueIcon name="bs:trash" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <p
        v-if="!loading && drafts.length === 0"
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No drafts yet. Start a new draft to begin writing.
      </p>

      <p
        v-if="error"
        class="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400"
      >
        {{ error }}
      </p>
    </div>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up to match the row-action buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
