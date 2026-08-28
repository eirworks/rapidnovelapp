<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import ProjectForm from './ProjectForm.vue'
import type { ProjectFormPayload } from './ProjectForm.vue'
import ProjectStats from './ProjectStats.vue'
import { useProjectStore } from '../store/projects'
import { useSearchStore } from '../store/search'
import { menus } from '../libs/features'
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const router = useRouter()
const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const searchStore = useSearchStore()

const editOpen = ref(false)

/** Local state for the faux search bar on the home view. */
const searchQuery = ref('')

function saveEdit(payload: ProjectFormPayload) {
  projectStore.editProject(payload.name, payload.description, payload.author)
  editOpen.value = false
}

/** Navigate to SearchView, pre-filling the query if one was passed. */
function openSearch(initialQuery = '') {
  searchStore.setInitialQuery(initialQuery)
  void router.push({ name: 'search', query: initialQuery ? { q: initialQuery } : {} })
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950"
  >
    <!-- No project open yet: welcome greeting and entry actions -->
    <template v-if="!projectStore.project">
      <div class="mb-5">
        <img src="/logo.svg" alt="Logo">
      </div> 
      <h1 class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Welcome to
        <span
          class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm"
        >
          RapidNovel
        </span>
      </h1>
      <p class="mt-3 text-slate-500 dark:text-slate-400">
        Plan, organize, and write your novel faster.
      </p>

      <div class="mt-10 flex w-72 flex-col gap-3">
        <AppButton
          variant="bordered"
          size="lg"
          @click="$emit('navigate', 'quick-write')"
        >
          Quick Write
        </AppButton>

        <AppButton
          variant="primary"
          size="lg"
          @click="$emit('navigate', 'new-project')"
        >
          New Project
        </AppButton>

        <AppButton
          variant="bordered"
          size="lg"
          @click="$emit('navigate', 'open-project')"
        >
          Open Project
        </AppButton>

        <AppButton
          variant="bordered"
          size="lg"
          @click="$emit('navigate', 'settings')"
        >
          Settings
        </AppButton>
      </div>
    </template>

    <!-- Project open: show the project header and its grouped menu grid -->
    <template v-else>
      <div
        class="flex w-full max-w-2xl items-start justify-between gap-4 text-left"
      >
        <div class="min-w-0">
          <h1 class="text-4xl font-bold tracking-tight">
            <span
              class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm"
            >
              {{ projectStore.project.name }}
            </span>
          </h1>
          <p
            v-if="projectStore.project.description"
            class="mt-2 truncate text-sm text-slate-500 dark:text-slate-400"
          >
            {{ projectStore.project.description }}
          </p>
          <p
            v-if="projectStore.project.author"
            class="text-xs text-slate-400 dark:text-slate-500"
          >
            {{ projectStore.project.author }}
          </p>
        </div>

        <AppButton
          variant="bordered"
          size="sm"
          class="shrink-0"
          @click="editOpen = true"
        >
          Edit Project
        </AppButton>
      </div>

      <ProjectStats class="mt-8" />

      <div class="mt-10 flex w-full max-w-2xl flex-col gap-10 text-left">
        <!-- Big faux search bar -->
        <div class="mx-auto w-full max-w-xl sm:max-w-2xl">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search characters, places, stories, tasks, notes…"
            @keyup.enter="openSearch(searchQuery)"
          >
            <template #trailing>
              <span class="flex h-full cursor-pointer items-center px-2 text-slate-400 transition hover:text-indigo-500 dark:hover:text-indigo-400" @click="openSearch(searchQuery)">
                <VueIcon name="bs:search" />
              </span>
            </template>
          </AppTextField>
        </div>
        <section v-for="menu in menus" :key="menu.label">
          <h2
            class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            {{ menu.label }}
          </h2>
          <!-- Thin underline below the menu title -->
          <div class="mt-1 h-px w-full bg-slate-200 dark:bg-slate-700"></div>

          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="item in menu.items"
              :key="item.view"
              type="button"
              class="menu-item flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-100/50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200/90 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              @click="$emit('navigate', item.view)"
            >
              <span v-if="item.icon" class="menu-item__icon flex items-center justify-center">
                <VueIcon :name="item.icon" />
              </span>
              {{ item.label }}
            </button>
          </div>
        </section>
      </div>
    </template>
  </main>

  <AppModal v-if="editOpen" title="Edit Project" @close="editOpen = false">
    <ProjectForm
      :initial-name="projectStore.project?.name ?? ''"
      :initial-description="projectStore.project?.description ?? ''"
      :initial-author="projectStore.project?.author ?? ''"
      submit-label="Save Changes"
      @save="saveEdit"
      @cancel="editOpen = false"
    />
  </AppModal>
</template>

<style scoped>
/* The VueIcon component renders a fixed 16px svg, so scale it up here. */
.menu-item__icon svg {
  width: 1.75rem;
  height: 1.75rem;
}
</style>
