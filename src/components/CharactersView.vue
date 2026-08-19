<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: []; navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Search text used to filter the sidebar character list. */
const search = ref('')
/** Currently selected character's id. */
const selectedId = ref<string | null>(null)
/** Whether the inline delete confirmation is currently shown. */
const confirmDelete = ref(false)

const allCharacters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

/** Characters whose name or aliases match the search text (case-insensitive). */
const filteredCharacters = computed<Character[]>(() => {
  const term = search.value.trim().toLowerCase()
  const matched = term
    ? allCharacters.value.filter((character) => {
        const haystack = [
          character.firstName,
          character.lastName,
          ...character.aliases,
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(term)
      })
    : allCharacters.value
  // Always keep the list sorted alphabetically by full name.
  return [...matched].sort((a, b) =>
    fullName(a).localeCompare(fullName(b)),
  )
})

const selectedCharacter = computed<Character | null>(
  () => project.value?.database.characters.find((c) => c.id === selectedId.value) ?? null,
)

/** Universes available to resolve a character's universe name. */
const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

/** Display name of the universe the selected character belongs to, if any. */
const universeName = computed<string | null>(() => {
  const universeId = selectedCharacter.value?.universeId
  if (!universeId) return null
  return universes.value.find((u) => u.id === universeId)?.name ?? null
})

/** The character's free-text description. */
const description = computed(() => selectedCharacter.value?.description ?? '')

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

/** Deletes the currently selected character and closes the confirmation. */
function confirmDeleteCharacter() {
  if (!selectedId.value) return
  project.value?.characterService.delete(selectedId.value)
  confirmDelete.value = false
}

/** Cancels the delete confirmation and keeps the selected character. */
function cancelDelete() {
  confirmDelete.value = false
}

// Auto-select the first character when none is selected yet (or the selected
// one disappears).
watch(allCharacters, (characters) => {
  if (!selectedId.value || !characters.some((c) => c.id === selectedId.value)) {
    selectedId.value = characters[0]?.id ?? null
    confirmDelete.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar: search + character list + New Character -->
    <aside
      class="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <header class="flex shrink-0 items-center px-4 py-3">
        <Breadcrumb
          :crumbs="[
            { label: 'Home', onClick: () => $emit('back') },
            { label: 'Characters' },
          ]"
        />
      </header>

      <!-- Search input at the top of the list -->
      <div class="shrink-0 px-4 pb-3">
        <AppTextField
          v-model="search"
          placeholder="Search characters…"
          class="w-full"
        >
          <template #trailing>
            <span class="flex h-full items-center px-1 text-slate-400 dark:text-slate-500">
              <VueIcon name="bs:search" />
            </span>
          </template>
        </AppTextField>
      </div>

      <!-- Character list -->
      <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          v-for="character in filteredCharacters"
          :key="character.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            character.id === selectedId
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
          "
          @click="selectedId = character.id; confirmDelete = false"
        >
          <span class="font-medium">{{ fullName(character) }}</span>          <span
            v-if="character.aliases.length > 0"
            class="truncate text-xs text-slate-400 dark:text-slate-500"
          >
            {{ character.aliases.join(', ') }}
          </span>
        </button>

        <p
          v-if="filteredCharacters.length === 0"
          class="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No characters found.
        </p>
      </div>

      <!-- New Character button at the bottom of the list -->
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
        <AppButton variant="primary" block @click="$emit('navigate', 'character-new')">
          <VueIcon name="bs:person-plus" />
          New Character
        </AppButton>
      </div>
    </aside>

    <!-- Main content: wiki-style character article -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <template v-if="selectedCharacter">
        <div class="mx-auto w-full max-w-4xl px-8 py-8">
          <!-- Article header + edit/delete actions -->
          <div class="flex items-start justify-between gap-4">
            <h1
              class="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {{ fullName(selectedCharacter) }}
            </h1>

            <!-- Top-right horizontal action menu -->
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="confirmDelete">
                <span
                  class="text-sm text-slate-500 dark:text-slate-400"
                >
                  Delete this character?
                </span>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600"
                  title="Yes, delete this character"
                  @click="confirmDeleteCharacter"
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
                  title="Edit character"
                  @click="$emit('navigate', 'character-edit', { id: selectedCharacter.id })"
                >
                  <VueIcon name="bs:pencil-square" />
                  Edit
                </button>
                <button
                  type="button"
                  class="menu-action flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                  title="Delete character"
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
                  v-if="selectedCharacter.isFemale === true || selectedCharacter.isFemale === false"
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Gender
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ selectedCharacter.isFemale ? 'Female' : 'Male' }}
                  </td>
                </tr>
                <tr
                  v-if="selectedCharacter.birthdate"
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Birthdate
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ selectedCharacter.birthdate }}
                  </td>
                </tr>
                <tr
                  v-if="selectedCharacter.aliases.length > 0"
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Aliases
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ selectedCharacter.aliases.join(', ') }}
                  </td>
                </tr>
                <tr
                  v-if="universeName"
                  class="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <th
                    class="w-28 py-1.5 pr-2 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                  >
                    Universe
                  </th>
                  <td class="py-1.5 text-slate-900 dark:text-slate-50">
                    {{ universeName }}
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

      <!-- Empty state when the project has no characters -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No characters yet. Add your first character to get started.
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
