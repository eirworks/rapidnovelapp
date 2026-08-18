<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Timeline } from '../libs/models/Timeline'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: [] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const timelines = computed<Timeline[]>(
  () => project.value?.database.timelines ?? [],
)

/** 1-2 character initial derived from the timeline name (used in the card box). */
function initials(timeline: Timeline): string {
  return timeline.name.trim().slice(0, 2).toUpperCase()
}

// --- Create / edit modal state ---
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const name = ref('')
const description = ref('')

function openCreate() {
  editingId.value = null
  name.value = ''
  description.value = ''
  modalOpen.value = true
}

function openEdit(timeline: Timeline) {
  editingId.value = timeline.id
  name.value = timeline.name
  description.value = timeline.description
  modalOpen.value = true
}

function save() {
  const projectValue = project.value
  if (!projectValue || !name.value.trim()) return

  const timeline = new Timeline(name.value.trim())
  timeline.description = description.value.trim()

  if (editingId.value) {
    timeline.id = editingId.value
    projectValue.timelineService.edit(editingId.value, timeline)
  } else {
    projectValue.timelineService.add(timeline)
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
            { label: 'Timeline' },
          ]"
        />

        <AppButton variant="primary" size="sm" @click="openCreate">
          New Timeline
        </AppButton>
      </div>

      <!-- Full-width cards -->
      <div class="mt-8 flex flex-col gap-4">
        <div
          v-for="timeline in timelines"
          :key="timeline.id"
          class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <!-- Gradient box with the timeline initials -->
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xl font-bold text-white"
          >
            {{ initials(timeline) }}
          </div>

          <div class="min-w-0 flex-1">
            <p
              class="truncate font-semibold text-slate-900 dark:text-slate-50"
              :title="timeline.name"
            >
              {{ timeline.name }}
            </p>
            <p
              v-if="timeline.description"
              class="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400"
            >
              {{ timeline.description }}
            </p>
          </div>

          <!-- Edit action (icon, modal); the card itself has no click handler -->
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
            title="Edit timeline"
            @click="openEdit(timeline)"
          >
            <VueIcon name="bs:pencil-square" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <p
        v-if="timelines.length === 0"
        class="mt-16 text-center text-slate-500 dark:text-slate-400"
      >
        No timelines yet. Add your first timeline to get started.
      </p>
    </div>

    <!-- Create / edit dialog -->
    <AppModal
      v-if="modalOpen"
      :title="editingId ? 'Edit Timeline' : 'New Timeline'"
      @close="modalOpen = false"
    >
      <form class="mt-6 space-y-4" @submit.prevent="save">
        <label
          class="block text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Name
          <AppTextField v-model="name" class="mt-1" placeholder="Timeline name" />
        </label>

        <label
          class="block text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Description
          <span class="font-normal text-slate-400 dark:text-slate-500">
            (optional)
          </span>
          <AppTextField
            v-model="description"
            multiline
            :rows="3"
            class="mt-1"
            placeholder="A brief description…"
          />
        </label>

        <div class="flex justify-end gap-3 pt-2">
          <AppButton variant="bordered" @click="modalOpen = false">
            Cancel
          </AppButton>
          <AppButton type="submit" :disabled="!name.trim()">
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
