<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Chapter } from '../libs/models/Chapter'
import type { Story } from '../libs/models/Story'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const chapters = computed<Chapter[]>(
  () => project.value?.chapterService.getAll() ?? [],
)

const stories = computed<Story[]>(
  () => project.value?.content.stories ?? [],
)

/** Publication filter: all chapters, only published, or only drafts. */
type StatusFilter = 'all' | 'published' | 'draft'

const statusFilter = ref<StatusFilter>('all')

/** Id of the story to narrow the list to; empty string means all stories. */
const storyFilter = ref('')

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Not published' },
]

/**
 * A chapter is orphaned when it carries no story id or its story no longer
 * exists in the project (e.g. the story was deleted).
 */
function isOrphaned(chapter: Chapter): boolean {
  if (!chapter.storyId) return true
  return !stories.value.some((s) => s.id === chapter.storyId)
}

/** Display name of the chapter's story, or null when the chapter is orphaned. */
function storyName(chapter: Chapter): string | null {
  if (!chapter.storyId) return null
  return stories.value.find((s) => s.id === chapter.storyId)?.title ?? null
}

/** Sorted list of chapters honoring the status and story filters. */
const filteredChapters = computed<Chapter[]>(() =>
  chapters.value
    .filter((chapter) => {
      if (statusFilter.value === 'published' && !chapter.isPublished) return false
      if (statusFilter.value === 'draft' && chapter.isPublished) return false
      if (storyFilter.value && chapter.storyId !== storyFilter.value) return false
      return true
    })
    .sort((a, b) => {
      // Orphans last, then group by story name, then by chapter number.
      const aOrphan = isOrphaned(a) ? 1 : 0
      const bOrphan = isOrphaned(b) ? 1 : 0
      if (aOrphan !== bOrphan) return aOrphan - bOrphan
      const aStory = storyName(a) ?? ''
      const bStory = storyName(b) ?? ''
      if (aStory !== bStory) return aStory.localeCompare(bStory)
      return a.number - b.number
    }),
)

/** Human-readable publication date for the badge tooltip. */
function publishedLabel(chapter: Chapter): string {
  if (!chapter.publishedAt) return ''
  const date = new Date(chapter.publishedAt)
  return Number.isNaN(date.getTime())
    ? chapter.publishedAt
    : date.toLocaleDateString()
}
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
            { label: 'Chapters' },
          ]"
        />

        <!-- Count next to the title -->
        <span class="text-sm text-slate-400 dark:text-slate-500">
          {{ filteredChapters.length }}
          {{ filteredChapters.length === 1 ? 'chapter' : 'chapters' }}
        </span>
      </div>

      <!-- Filters: publication status pills + story selector -->
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <div
          class="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800"
        >
          <button
            v-for="option in statusOptions"
            :key="option.id"
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            :class="
              statusFilter === option.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            "
            @click="statusFilter = option.id"
          >
            {{ option.label }}
          </button>
        </div>

        <select
          v-model="storyFilter"
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          title="Filter by story"
        >
          <option value="">All stories</option>
          <option v-for="story in stories" :key="story.id" :value="story.id">
            {{ story.title }}
          </option>
        </select>
      </div>

      <!-- Full-width cards -->
      <div class="mt-6 flex flex-col gap-4">
        <div
          v-for="chapter in filteredChapters"
          :key="chapter.id"
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
          role="button"
          tabindex="0"
          @click="$emit('navigate', 'chapter-detail', { id: chapter.id })"
          @keydown.enter="$emit('navigate', 'chapter-detail', { id: chapter.id })"
          @keydown.space.prevent="$emit('navigate', 'chapter-detail', { id: chapter.id })"
        >
          <!-- Gradient box with the chapter number -->
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xl font-bold text-white"
            :title="`Chapter ${chapter.number}`"
          >
            {{ chapter.number }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p
                class="min-w-0 truncate font-semibold text-slate-900 dark:text-slate-50"
                :title="chapter.title"
              >
                {{ chapter.title }}
              </p>

              <!-- Publication badge -->
              <span
                v-if="chapter.isPublished"
                class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
                :title="`Published ${publishedLabel(chapter)}`"
              >
                Published
              </span>
              <span
                v-else
                class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                title="Not published yet"
              >
                Draft
              </span>
            </div>

            <!-- Story name, or a warning badge when the chapter is orphaned -->
            <p
              v-if="storyName(chapter)"
              class="mt-0.5 truncate text-sm text-emerald-600 dark:text-emerald-400"
            >
              {{ storyName(chapter) }}
            </p>
            <p
              v-else
              class="mt-0.5 flex items-center gap-1 truncate text-sm font-medium text-amber-600 dark:text-amber-400"
              title="This chapter doesn't belong to any story"
            >
              <VueIcon name="bs:exclamation-triangle-fill" />
              Orphaned Chapter
            </p>

            <p
              v-if="chapter.warning"
              class="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400"
              :title="chapter.warning"
            >
              ⚠ {{ chapter.warning }}
            </p>
            <p
              v-else-if="chapter.note"
              class="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500"
              :title="chapter.note"
            >
              {{ chapter.note }}
            </p>
          </div>

          <!-- Chevron affordance for the read-only navigation -->
          <VueIcon
            name="bs:chevron-right"
            class="shrink-0 text-slate-300 dark:text-slate-600"
          />
        </div>
      </div>

      <!-- Empty states -->
      <p
        v-if="chapters.length === 0"
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No chapters yet. Create a story with chapters to get started.
      </p>
      <p
        v-else-if="filteredChapters.length === 0"
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No chapters match the current filters.
      </p>
    </div>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up to match the card-action buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
