<script setup lang="ts">
import AppButton from './ui/AppButton.vue'
import { useProjectStore } from '../store/projects'
import { menus } from '../libs/features'
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950"
  >
    <!-- No project open yet: welcome greeting and entry actions -->
    <template v-if="!projectStore.project">
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

    <!-- Project open: show the project name and its grouped menu grid -->
    <template v-else>
      <h1 class="text-4xl font-bold tracking-tight">
        <span
          class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm"
        >
          {{ projectStore.project.name }}
        </span>
      </h1>

      <div
        class="mt-10 flex w-full max-w-2xl flex-col gap-10 text-left"
      >
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
</template>

<style scoped>
/* The VueIcon component renders a fixed 16px svg, so scale it up here. */
.menu-item__icon svg {
  width: 1.75rem;
  height: 1.75rem;
}
</style>
