<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Scene } from '../libs/models/Scene'
import type { Plot } from '../libs/models/Plot'
import type { Character } from '../libs/models/Character'

/**
 * Create/edit form for a single scene. Handles every Scene field: title,
 * description, plot id, pov character, and number (sorting). Props come from
 * the route: `id` is `'new'` for create mode, or an existing scene id for edit
 * mode.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.scenes.find((s) => s.id === props.id) ?? null
    : null,
)

// Initialise the form from the scene being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const title = ref(existing.value?.title ?? '')
const description = ref(existing.value?.description ?? '')
const plotId = ref(existing.value?.plotId ?? '')
const povCharacterId = ref<string>(existing.value?.povCharacterId ?? '')
const number = ref<number>(existing.value?.number ?? 0)

const formTitle = computed(() => (isEdit.value ? 'Edit Scene' : 'New Scene'))

/** Plots available for the parent selector. */
const plots = computed<Plot[]>(
  () => project.value?.database.plots ?? [],
)

/** Characters available for the POV selector. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'scenes')
}

function save() {
  if (!title.value.trim()) return

  const scene = new Scene(title.value.trim(), plotId.value)
  // If the id is empty, fill it with a fresh UUID.
  scene.id = id.value.trim() || crypto.randomUUID()
  scene.description = description.value.trim()
  scene.povCharacterId = povCharacterId.value || null
  scene.number = number.value

  if (isEdit.value) {
    project.value?.sceneService.edit(scene.id, scene)
  } else {
    project.value?.sceneService.add(scene)
  }

  goBack()
}
</script>

<template>
  <main
    class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950"
  >
    <!-- Toolbar -->
    <header
      class="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: goHome },
          { label: 'Scenes', onClick: goBack },
          { label: formTitle },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!title.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Scene' }}
      </AppButton>
    </header>

    <!-- Simple form page -->
    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <form
        class="mx-auto w-full max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        @submit.prevent="save"
      >
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
          <input
            v-model="title"
            type="text"
            spellcheck="true"
            placeholder="e.g. The Storm Approaches"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          />
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="description"
            rows="4"
            spellcheck="true"
            placeholder="Describe what happens in this scene…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <div class="grid grid-cols-2 gap-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Scene Number
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <input
              v-model.number="number"
              type="number"
              min="0"
              step="1"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            POV Character
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <select
              v-model="povCharacterId"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="">None</option>
              <option v-for="character in characters" :key="character.id" :value="character.id">
                {{ fullName(character) }}
              </option>
            </select>
          </label>
        </div>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Plot
          <span class="font-normal text-slate-400 dark:text-slate-500">(required)</span>
          <select
            v-model="plotId"
            :class="{
              'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900': !plotId && isEdit
            }"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option value="">Select a plot…</option>
            <option v-for="plot in plots" :key="plot.id" :value="plot.id">
              {{ plot.name }}
            </option>
          </select>
        </label>
      </form>
    </section>
  </main>
</template>
