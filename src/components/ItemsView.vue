<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Item } from '../libs/models/Item'
import type { Character } from '../libs/models/Character'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Search text used to filter the sidebar item list. */
const search = ref('')
/** Currently selected item's id. */
const selectedId = ref<string | null>(null)
/** Whether the inline delete confirmation is currently shown. */
const confirmDelete = ref(false)

const allItems = computed<Item[]>(
  () => project.value?.database.items ?? [],
)

/** Characters available to resolve an item's owner name. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

/** Items whose name or type matches the search text (case-insensitive). */
const filteredItems = computed<Item[]>(() => {
  const term = search.value.trim().toLowerCase()
  const matched = term
    ? allItems.value.filter((item) =>
        [item.name, item.type].join(' ').toLowerCase().includes(term),
      )
    : allItems.value
  // Always keep the list sorted alphabetically by name.
  return [...matched].sort((a, b) => a.name.localeCompare(b.name))
})

const selectedItem = computed<Item | null>(
  () => project.value?.database.items.find((i) => i.id === selectedId.value) ?? null,
)

/** The item's free-text description. */
const description = computed(() => selectedItem.value?.description ?? '')

/** The selected item's owner display name, or null when unowned. */
const ownerName = computed<string | null>(() => {
  const ownerId = selectedItem.value?.ownerId
  if (!ownerId) return null
  const character = characters.value.find((c) => c.id === ownerId)
  return character ? fullName(character) : null
})

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

/** Deletes the currently selected item and closes the confirmation. */
function confirmDeleteItem() {
  if (!selectedId.value) return
  project.value?.itemService.delete(selectedId.value)
  confirmDelete.value = false
}

/** Cancels the delete confirmation and keeps the selected item. */
function cancelDelete() {
  confirmDelete.value = false
}

// Auto-select the first item when none is selected yet (or the selected
// one disappears).
watch(allItems, (items) => {
  if (!selectedId.value || !items.some((i) => i.id === selectedId.value)) {
    selectedId.value = items[0]?.id ?? null
    confirmDelete.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar: search + item list + New Item -->
    <aside
      class="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <header class="flex shrink-0 items-center px-4 py-3">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Items' },
          ]"
        />
      </header>

      <!-- Search input at the top of the list -->
      <div class="shrink-0 px-4 pb-3">
        <AppTextField
          v-model="search"
          placeholder="Search items…"
          class="w-full"
        >
          <template #trailing>
            <span class="flex h-full items-center px-1 text-slate-400 dark:text-slate-500">
              <VueIcon name="bs:search" />
            </span>
          </template>
        </AppTextField>
      </div>

      <!-- Item list -->
      <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            item.id === selectedId
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
          "
          @click="selectedId = item.id; confirmDelete = false"
        >
          <span class="font-medium">{{ item.name }}</span>
          <span
            class="truncate text-xs text-slate-400 dark:text-slate-500"
          >
            {{ item.type }}
          </span>
        </button>

        <p
          v-if="filteredItems.length === 0"
          class="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No items found.
        </p>
      </div>

      <!-- New Item button at the bottom of the list -->
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
        <AppButton variant="primary" block @click="$emit('navigate', 'item-new')">
          <VueIcon name="bs:box" />
          New Item
        </AppButton>
      </div>
    </aside>

    <!-- Main content: wiki-style item article -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <template v-if="selectedItem">
        <div class="mx-auto w-full max-w-4xl px-8 py-8">
          <!-- Article header + edit/delete actions -->
          <div class="flex items-start justify-between gap-4">
            <h1
              class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {{ selectedItem.name }}
            </h1>

            <!-- Top-right horizontal action menu -->
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="confirmDelete">
                <span
                  class="text-sm text-slate-500 dark:text-slate-400"
                >
                  Delete this item?
                </span>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600"
                  title="Yes, delete this item"
                  @click="confirmDeleteItem"
                >
                  Yes
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Cancel"
                  @click="cancelDelete"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
                  title="Edit item"
                  @click="$emit('navigate', 'item-edit', { id: selectedItem.id })"
                >
                  <VueIcon name="bs:pencil-square" />
                  Edit
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                  title="Delete item"
                  @click="confirmDelete = true"
                >
                  <VueIcon name="bs:trash" />
                  Delete
                </button>
              </template>
            </div>
          </div>

          <!-- Infobox floats to the right; description wraps around it -->
          <aside
            class="float-right ml-6 mb-4 w-72 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <table class="w-full border-collapse text-sm">
              <tbody>
                <tr
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Type
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ selectedItem.type }}
                  </td>
                </tr>
                <tr
                  v-if="ownerName"
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Owner
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ ownerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </aside>

          <!-- Main article content: description -->
          <article class="mt-8">
            <p
              class="whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200"
            >
              {{ description || 'No description yet.' }}
            </p>
          </article>
        </div>
      </template>

      <!-- Empty state when the project has no items -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No items yet. Add your first item to get started.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* VueIcon renders a fixed 16px svg; scale it up for the action buttons. */
.menu-action svg {
  width: 1rem;
  height: 1rem;
}
</style>
