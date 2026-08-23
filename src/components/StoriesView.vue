<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Story } from '../libs/models/Story'
import type { StoryFormat } from '../libs/models/Story'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const stories = computed<Story[]>(
  () => project.value?.content.stories ?? [],
)

/** 1-2 character initial derived from the story title (used in the card box). */
function initials(story: Story): string {
  return story.title.trim().slice(0, 2).toUpperCase()
}

/** Human-readable format label shown on the card badge. */
function formatLabel(format: StoryFormat): string {
  return format === 'book' ? 'Book' : 'Chapters'
}

// --- Create / edit modal state ---
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const title = ref('')
const summary = ref('')
const format = ref<StoryFormat>('book')

function openCreate() {
  editingId.value = null
  title.value = ''
  summary.value = ''
  format.value = 'book'
  modalOpen.value = true
}

function openEdit(story: Story) {
  editingId.value = story.id
  title.value = story.title
  summary.value = story.summary
  format.value = story.format
  modalOpen.value = true
}

function save() {
  const projectValue = project.value
  if (!projectValue || !title.value.trim()) return

  const story = new Story(title.value.trim())
  story.summary = summary.value.trim()
  story.format = format.value

  if (editingId.value) {
    story.id = editingId.value
    projectValue.storyService.edit(editingId.value, story)
  } else {
    projectValue.storyService.add(story)
  }

  modalOpen.value = false
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
            { label: 'Story' },
          ]"
        />

        <AppButton variant="primary" size="sm" @click="openCreate">
          New Story
        </AppButton>
      </div>

      <!-- Full-width cards -->
      <div class="mt-8 flex flex-col gap-4">
        <div
          v-for="story in stories"
          :key="story.id"
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
          role="button"
          tabindex="0"
          @click="openEdit(story)"
          @keydown.enter="openEdit(story)"
          @keydown.space.prevent="openEdit(story)"
        >
          <!-- Gradient box with the story initials -->
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-xl font-bold text-white"
          >
            {{ initials(story) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p
                class="truncate font-semibold text-slate-900 dark:text-slate-50"
                :title="story.title"
              >
                {{ story.title }}
              </p>
              <!-- Format badge (book vs chapters) -->
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  story.format === 'book'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                "
              >
                {{ formatLabel(story.format) }}
              </span>
            </div>
            <p
              v-if="story.summary"
              class="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400"
            >
              {{ story.summary }}
            </p>
            <p
              v-else
              class="mt-0.5 text-sm italic text-slate-400 dark:text-slate-500"
            >
              No summary yet
            </p>
          </div>

          <!-- Edit action (icon, modal); the card itself opens the same dialog -->
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
            title="Edit story"
            @click.stop="openEdit(story)"
          >
            <VueIcon name="bs:pencil-square" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <p
        v-if="stories.length === 0"
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No stories yet. Add your first story to get started.
      </p>
    </div>

    <!-- Create / edit dialog -->
    <AppModal
      v-if="modalOpen"
      :title="editingId ? 'Edit Story' : 'New Story'"
      @close="modalOpen = false"
    >
      <form class="mt-6 space-y-4" @submit.prevent="save">
        <label
          class="block text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Title
          <AppTextField v-model="title" class="mt-1" placeholder="Story title" />
        </label>

        <label
          class="block text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Summary
          <span class="font-normal text-slate-400 dark:text-slate-500">
            (optional)
          </span>
          <AppTextField
            v-model="summary"
            multiline
            :rows="3"
            class="mt-1"
            placeholder="A brief summary…"
          />
        </label>

        <label
          class="block text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Format
          <select
            v-model="format"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option value="book">Book</option>
            <option value="chapters">Chapters</option>
          </select>
        </label>

        <div class="flex justify-end gap-3 pt-2">
          <AppButton variant="bordered" @click="modalOpen = false">
            Cancel
          </AppButton>
          <AppButton type="submit" :disabled="!title.trim()">
            Save
          </AppButton>
        </div>
      </form>
    </AppModal>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up to match the row-action buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
