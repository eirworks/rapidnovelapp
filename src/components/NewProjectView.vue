<script setup lang="ts">
import { ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import { useProjectStore } from '../store/projects'

const emit = defineEmits<{ back: [] }>()

const projectStore = useProjectStore()

const name = ref('')
const description = ref('')
const author = ref('')

function create() {
  if (!name.value.trim()) return
  projectStore.createProject(
    name.value.trim(),
    description.value.trim(),
    author.value.trim(),
  )
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

      <form class="mt-6 space-y-4" @submit.prevent="create">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Name
          <AppTextField v-model="name" class="mt-1" placeholder="My Novel" />
        </label>

        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
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
            placeholder="A brief summary of your story…"
          />
        </label>

        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Author
          <span class="font-normal text-slate-400 dark:text-slate-500">
            (optional)
          </span>
          <AppTextField
            v-model="author"
            class="mt-1"
            placeholder="Your name"
          />
        </label>

        <div class="flex justify-end gap-3 pt-2">
          <AppButton variant="bordered" @click="$emit('back')">
            Cancel
          </AppButton>
          <AppButton type="submit" :disabled="!name.trim()">
            Create Project
          </AppButton>
        </div>
      </form>
    </div>
  </main>
</template>
