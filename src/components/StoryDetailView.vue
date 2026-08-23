<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Story, StoryFormat } from '../libs/models/Story'
import type { Chapter } from '../libs/models/Chapter'
import { formatLabel } from '../libs/storyFormat'

/**
 * Read-only detail view for a single story: shows the story's information and
 * the full list of its chapters, ordered by chapter number. Chapters cannot be
 * created or edited from here.
 */
const props = defineProps<{ id: string }>()

const emit = defineEmits<{ navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const story = computed<Story | null>(
  () => project.value?.content.stories.find((s) => s.id === props.id) ?? null,
)

/** The story's chapters, ordered by their chapter number. */
const chapters = computed<Chapter[]>(() =>
  project.value ? project.value.chapterService.getByStoryId(props.id) : [],
)

/** Human-readable format label shown as a badge next to the story title. */
const format = computed<StoryFormat | null>(() => story.value?.format ?? null)

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'story')
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <div class="mx-auto w-full max-w-4xl">
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: goHome },
          { label: 'Story', onClick: goBack },
          { label: story?.title || 'Story' },
        ]"
      />

      <template v-if="story">
        <!-- Story information -->
        <header
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {{ story.title }}
            </h2>
            <span
              v-if="format"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="
                format === 'book'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              "
            >
              {{ formatLabel(format) }}
            </span>
          </div>
          <p
            v-if="story.summary"
            class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {{ story.summary }}
          </p>
          <p v-else class="mt-2 text-sm italic text-slate-400 dark:text-slate-500">
            No summary yet.
          </p>
        </header>

        <!-- Chapters -->
        <section
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h3
            class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Chapters
            <span class="font-normal normal-case">({{ chapters.length }})</span>
          </h3>

          <ol v-if="chapters.length > 0" class="mt-3 space-y-1">
            <li
              v-for="chapter in chapters"
              :key="chapter.id"
              class="rounded-lg px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <div class="flex items-center gap-2">
                <!-- Chapter number, used for ordering -->
                <span
                  class="w-8 shrink-0 text-right text-sm font-semibold text-slate-400 tabular-nums dark:text-slate-500"
                >
                  {{ chapter.number }}
                </span>
                <p class="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
                  {{ chapter.title }}
                </p>
                <!-- Green badge for chapters with a publication date -->
                <span
                  v-if="chapter.publishedAt"
                  class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
                  :title="`Published ${chapter.publishedAt}`"
                >
                  Published
                </span>
              </div>
              <p
                v-if="chapter.warning"
                class="ml-10 mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400"
                :title="chapter.warning"
              >
                ⚠ {{ chapter.warning }}
              </p>
              <p
                v-else-if="chapter.note"
                class="ml-10 mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500"
                :title="chapter.note"
              >
                {{ chapter.note }}
              </p>
            </li>
          </ol>
          <p v-else class="mt-3 text-sm text-slate-400 dark:text-slate-500">
            This story has no chapters yet.
          </p>
        </section>
      </template>

      <!-- Empty state when the story does not exist -->
      <p v-else class="mt-16 text-center text-slate-500 dark:text-slate-400">
        Story not found.
      </p>
    </div>
  </main>
</template>
