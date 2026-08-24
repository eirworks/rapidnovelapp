<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Chapter } from '../libs/models/Chapter'
import type { Story } from '../libs/models/Story'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

/**
 * Read-only detail view for a single chapter: shows its metadata (number,
 * story, publication state) and its full body text. Chapters cannot be edited
 * from here.
 */
const props = defineProps<{ id: string }>()

const emit = defineEmits<{ navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const chapter = computed<Chapter | null>(
  () => project.value?.chapterService.getById(props.id) ?? null,
)

/** The chapter's story, or null when orphaned or the story is missing. */
const story = computed<Story | null>(() => {
  const storyId = chapter.value?.storyId
  if (!storyId) return null
  return project.value?.content.stories.find((s) => s.id === storyId) ?? null
})

/** Human-readable publication date, or null while the chapter is a draft. */
const publishedLabel = computed<string | null>(() => {
  if (!chapter.value?.publishedAt) return null
  const date = new Date(chapter.value.publishedAt)
  return Number.isNaN(date.getTime()) ? chapter.value.publishedAt : date.toLocaleDateString()
})

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'chapters')
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50"
  >
    <div class="mx-auto w-full max-w-4xl">
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: goHome },
          { label: 'Chapters', onClick: goBack },
          { label: chapter?.title || 'Chapter' },
        ]"
      />

      <template v-if="chapter">
        <!-- Chapter information -->
        <header
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white"
              :title="`Chapter ${chapter.number}`"
            >
              {{ chapter.number }}
            </span>
            <h2
              class="min-w-0 flex-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {{ chapter.title }}
            </h2>

            <!-- Publication badge -->
            <span
              v-if="chapter.isPublished"
              class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
              :title="publishedLabel ? `Published ${publishedLabel}` : 'Published'"
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

          <!-- Story link, or a warning badge when the chapter is orphaned -->
          <div class="mt-3">
            <button
              v-if="story"
              type="button"
              class="flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-emerald-600 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              @click="emit('navigate', 'story-detail', { id: story.id })"
            >
              <VueIcon name="bs:book" />
              {{ story.title }}
            </button>
            <span
              v-else
              class="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
              title="This chapter doesn't belong to any story"
            >
              <VueIcon name="bs:exclamation-triangle-fill" />
              Orphaned Chapter
            </span>
          </div>
        </header>

        <!-- Content warning and author note -->
        <div v-if="chapter.warning || chapter.note" class="mt-4 space-y-2">
          <p
            v-if="chapter.warning"
            class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            <span class="font-semibold">Warning:</span> {{ chapter.warning }}
          </p>
          <p
            v-if="chapter.note"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm italic text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <span class="font-semibold not-italic">Note:</span> {{ chapter.note }}
          </p>
        </div>

        <!-- Chapter body -->
        <section
          class="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <p
            v-if="chapter.content"
            class="whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
          >
            {{ chapter.content }}
          </p>
          <p v-else class="text-sm italic text-slate-400 dark:text-slate-500">
            This chapter has no content yet.
          </p>
        </section>
      </template>

      <!-- Empty state when the chapter does not exist -->
      <p v-else class="mt-16 text-center text-slate-500 dark:text-slate-400">
        Chapter not found.
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
