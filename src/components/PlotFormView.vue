<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Plot } from '../libs/models/Plot'
import type { Place } from '../libs/models/Place'
import type { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'

/**
 * Create/edit form for a single plot. Handles every Plot field: name,
 * description, place, actors (characters), number, and goal. Props come from
 * the route: `id` is `'new'` for create mode, or an existing plot id for edit
 * mode.
 *
 * Layout mirrors GroupFormView: a header toolbar, and a single-column form
 * page with all fields in a card.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.plots.find((p) => p.id === props.id) ?? null
    : null,
)

// Initialise the form from the plot being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const description = ref(existing.value?.description ?? '')
const placeId = ref(existing.value?.placeId ?? '')
const actorIds = ref<string[]>(existing.value?.actorIds ?? [])
const number = ref<number>(existing.value?.number ?? 0)
const goal = ref(existing.value?.goal ?? '')
const status = ref(existing.value?.status ?? 'pending')
const universeId = ref(existing.value?.universeId ?? '')

const title = computed(() => (isEdit.value ? 'Edit Plot' : 'New Plot'))

const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

/** Characters available for the actors multi-select. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

/** Places available for the place selector. */
const places = computed<Place[]>(
  () => project.value?.database.places ?? [],
)

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

/** Toggles an actor id in the selected set. */
function toggleActor(actorId: string) {
  if (actorIds.value.includes(actorId)) {
    actorIds.value = actorIds.value.filter((id) => id !== actorId)
  } else {
    actorIds.value = [...actorIds.value, actorId]
  }
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'plots')
}

function save() {
  if (!name.value.trim()) return

  const plot = new Plot(name.value.trim())
  // If the id is empty, fill it with a fresh UUID.
  plot.id = id.value.trim() || crypto.randomUUID()
  plot.description = description.value.trim()
  plot.placeId = placeId.value.trim() || null
  plot.actorIds = [...actorIds.value]
  plot.number = number.value
  plot.goal = goal.value.trim()
  plot.status = status.value
  plot.universeId = universeId.value

  if (isEdit.value) {
    project.value?.plotService.edit(plot.id, plot)
  } else {
    project.value?.plotService.add(plot)
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
          { label: 'Plots', onClick: goBack },
          { label: title },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Plot' }}
      </AppButton>
    </header>

    <!-- Simple form page -->
    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <form
        class="mx-auto w-full max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        @submit.prevent="save"
      >
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Name
          <AppTextField v-model="name" class="mt-1" placeholder="e.g. The King's Return" />
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="description"
            rows="4"
            spellcheck="true"
            placeholder="Describe the plot…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Goal
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="goal"
            rows="3"
            spellcheck="true"
            placeholder="What does this plot aim to achieve?…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <div class="grid grid-cols-3 gap-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sort Number
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
            Status
            <select
              v-model="status"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="discard">Discarded</option>
            </select>
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Place
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <select
              v-model="placeId"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="">None</option>
              <option v-for="place in places" :key="place.id" :value="place.id">
                {{ place.name }}
              </option>
            </select>
          </label>
        </div>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Universe
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <select
            v-model="universeId"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option value="">None</option>
            <option v-for="universe in universes" :key="universe.id" :value="universe.id">
              {{ universe.name }}
            </option>
          </select>
        </label>

        <fieldset>
          <legend class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Characters
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </legend>

          <div
            v-if="characters.length > 0"
            class="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-600"
          >
            <label
              v-for="character in characters"
              :key="character.id"
              class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                :checked="actorIds.includes(character.id)"
                @change="toggleActor(character.id)"
              />
              <span class="truncate">{{ fullName(character) }}</span>
            </label>
          </div>
          <p v-else class="mt-1 text-sm text-slate-400 dark:text-slate-500">
            No characters available yet.
          </p>
        </fieldset>
      </form>
    </section>
  </main>
</template>