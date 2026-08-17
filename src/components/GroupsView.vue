<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Group, GroupType } from '../libs/models/Group'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

const emit = defineEmits<{
  back: []
  navigate: [view: string, params?: Record<string, string>]
}>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Id of the group awaiting delete confirmation. */
const confirmDeleteId = ref<string | null>(null)

const groups = computed<Group[]>(() => project.value?.database.groups ?? [])

/** Tailwind badge classes per group type, for both light and dark themes. */
const typeStyles: Record<GroupType, string> = {
  character: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  place: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  item: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

function confirmDelete(group: Group) {
  confirmDeleteId.value = group.id
}

function doDelete() {
  if (!confirmDeleteId.value) return
  project.value?.groupService.delete(confirmDeleteId.value)
  confirmDeleteId.value = null
}

function cancelDelete() {
  confirmDeleteId.value = null
}

function editGroup(group: Group) {
  emit('navigate', 'group-edit', { id: group.id })
}

function viewGroup(group: Group) {
  emit('navigate', 'group-detail', { id: group.id })
}
</script>

<template>
  <main class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <!-- Toolbar -->
    <header
      class="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: () => $emit('back') },
          { label: 'Groups' },
        ]"
      />
      <span class="flex-1"></span>
      <AppButton @click="$emit('navigate', 'group-new')">
        <VueIcon name="bs:plus-lg" />
        New Group
      </AppButton>
    </header>

    <!-- Group list -->
    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <ul v-if="groups.length > 0" class="mx-auto w-full max-w-3xl space-y-2">
        <li
          v-for="group in groups"
          :key="group.id"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
          @click="viewGroup(group)"
        >
          <!-- Name + description -->
          <div class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {{ group.name }}
            </span>
            <span
              v-if="group.description"
              class="block truncate text-xs text-slate-400 dark:text-slate-500"
            >
              {{ group.description }}
            </span>
            <span class="mt-1 block text-xs text-slate-400 dark:text-slate-500">
              {{ group.memberIds.length }} member{{ group.memberIds.length === 1 ? '' : 's' }}
            </span>
          </div>

          <!-- Type badge -->
          <span
            class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            :class="typeStyles[group.type]"
          >
            {{ group.type }}
          </span>

          <!-- Row actions -->
          <div class="flex shrink-0 items-center gap-1" @click.stop>
            <template v-if="confirmDeleteId === group.id">
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold bg-red-600 text-white transition hover:bg-red-700"
                @click="doDelete"
              >
                Delete
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                @click="cancelDelete"
              >
                Cancel
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
                title="Edit group"
                @click="editGroup(group)"
              >
                <VueIcon name="bs:pencil-square" />
              </button>
              <button
                type="button"
                class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
                title="Delete group"
                @click="confirmDelete(group)"
              >
                <VueIcon name="bs:trash" />
              </button>
            </template>
          </div>
        </li>
      </ul>

      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No groups yet. Add your first group to get started.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up for the toolbar and row action buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
