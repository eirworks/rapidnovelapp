<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Note } from '../libs/models/management/Note'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const notes = computed<Note[]>(
  () => project.value?.management.notes ?? [],
)
</script>

<template>
  <main
    class="flex min-h-screen flex-col bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50"
  >
    <div class="mx-auto w-full max-w-5xl">
      <div class="flex items-center justify-between gap-4">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Notes' },
          ]"
        />

        <AppButton variant="primary" size="sm" @click="$emit('navigate', 'note-new')">
          New Note
        </AppButton>
      </div>

      <!-- Note cards in a 3-per-row grid; each card opens the full-page editor -->
      <div
        v-if="notes.length > 0"
        class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="note in notes"
          :key="note.id"
          class="flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
          role="button"
          tabindex="0"
          @click="$emit('navigate', 'note-edit', { id: note.id })"
          @keydown.enter="$emit('navigate', 'note-edit', { id: note.id })"
          @keydown.space.prevent="$emit('navigate', 'note-edit', { id: note.id })"
        >
          <div class="flex items-start justify-between gap-2">
            <h3
              class="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-slate-50"
              :title="note.title"
            >
              {{ note.title }}
            </h3>

            <!-- Edit affordance; the card itself also opens the editor -->
            <button
              type="button"
              class="flex shrink-0 cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
              title="Edit note"
              @click.stop="$emit('navigate', 'note-edit', { id: note.id })"
            >
              <VueIcon name="bs:pencil-square" />
            </button>
          </div>

          <!-- Note body: show up to 6 lines, fading out at the end -->
          <p
            v-if="note.content"
            class="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {{ note.content }}
          </p>
          <p
            v-else
            class="mt-2 text-sm italic text-slate-400 dark:text-slate-500"
          >
            No content
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <p
        v-else
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No notes yet. Add your first note to get started.
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
