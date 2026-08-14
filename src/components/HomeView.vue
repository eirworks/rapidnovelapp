<script setup lang="ts">
import AppButton from './ui/AppButton.vue'
import { useProjectStore } from '../store/projects'
import type { MenuGroup } from '../libs/models/MenuGroup'
import { ref } from 'vue'

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()

// Grouped menus shown when a project is open, matching the commented-out
// Database and Write menus in electron/main/index.ts.
const menus: MenuGroup[] = [
  {
    label: 'Database',
    items: [
      { label: 'Characters', view: 'characters' },
      { label: 'Places', view: 'places' },
      { label: 'Items', view: 'items' },
      { label: 'Timeline', view: 'timeline' },
      { label: 'Plots', view: 'plots' },
    ],
  },
  {
    label: 'Write',
    items: [
      { label: 'Draft', view: 'draft' },
      { label: 'Story', view: 'story' },
      { label: 'Chapters', view: 'chapters' },
    ],
  },
]

const openMenu = ref<number | null>(null)

function toggleMenu(index: number) {
  openMenu.value = openMenu.value === index ? null : index
}

function selectItem(view: string) {
  openMenu.value = null
  emit('navigate', view)
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950"
  >
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

    <div v-if="!projectStore.project" class="mt-10 flex w-72 flex-col gap-3">
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

    <!-- Grouped menus shown only when a project is open -->
    <div v-else class="relative mt-10 flex flex-wrap items-start justify-center gap-3">
      <template v-for="(menu, index) in menus" :key="menu.label">
        <div class="relative">
          <AppButton
            variant="bordered"
            size="lg"
            @click="toggleMenu(index)"
          >
            {{ menu.label }}
            <span class="text-xs text-slate-400 dark:text-slate-500">▾</span>
          </AppButton>

          <div
            v-if="openMenu === index"
            class="absolute left-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <button
              v-for="item in menu.items"
              :key="item.view"
              type="button"
              class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              @click="selectItem(item.view)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
