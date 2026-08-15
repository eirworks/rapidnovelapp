<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import { useProjectStore } from '../store/projects'
import { useStatusBarStore } from '../store/statusBar'
import type { ProjectSummary } from '../libs/models/ProjectData'

const emit = defineEmits<{ back: [] }>()

const projectStore = useProjectStore()
const statusBar = useStatusBarStore()

const projects = ref<ProjectSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/** Fetches the list of saved projects from the main process. */
async function listProjects() {
  loading.value = true
  error.value = null
  try {
    projects.value = await window.projectApi.list()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

/** Loads a project into the store and returns to the home page. */
async function open(item: ProjectSummary) {
  try {
    const data = await window.projectApi.load(item.id)
    projectStore.loadProject(data)
    emit('back')
  } catch (e) {
    statusBar.danger(`Failed to load project: ${(e as Error).message}`)
  }
}

onMounted(listProjects)
</script>

<template>
  <main
    class="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <h1
        class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
      >
        Open Project
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Choose a saved project to open.
      </p>

      <!-- Loading state -->
      <p
        v-if="loading"
        class="mt-6 text-sm text-slate-500 dark:text-slate-400"
      >
        Loading projects…
      </p>

      <!-- Error state -->
      <p v-else-if="error" class="mt-6 text-sm text-red-500 dark:text-red-400">
        {{ error }}
      </p>

      <!-- Empty state -->
      <p
        v-else-if="projects.length === 0"
        class="mt-6 text-sm text-slate-500 dark:text-slate-400"
      >
        No saved projects yet.
      </p>

      <!-- Project list -->
      <ul v-else class="mt-6 space-y-2">
        <li v-for="item in projects" :key="item.id">
          <button
            type="button"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-indigo-400 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-slate-800"
            @click="open(item)"
          >
            <span
              class="block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              {{ item.name }}
            </span>
            <span
              v-if="item.description"
              class="block truncate text-xs text-slate-500 dark:text-slate-400"
            >
              {{ item.description }}
            </span>
          </button>
        </li>
      </ul>

      <div class="mt-6 flex justify-end">
        <AppButton variant="bordered" @click="$emit('back')">Back</AppButton>
      </div>
    </div>
  </main>
</template>
