<script setup lang="ts">
import ProjectForm from './ProjectForm.vue'
import type { ProjectFormPayload } from './ProjectForm.vue'
import { useProjectStore } from '../store/projects'

const emit = defineEmits<{ back: [] }>()

const projectStore = useProjectStore()

function create(payload: ProjectFormPayload) {
  projectStore.createProject(payload.name, payload.description, payload.author)
  // Project is now active; the home view switches to the project menus.
  emit('back')
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <h1
        class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
      >
        New Project
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Start a new novel. Only the name is required.
      </p>

      <ProjectForm
        submit-label="Create Project"
        @save="create"
        @cancel="$emit('back')"
      />
    </div>
  </main>
</template>
