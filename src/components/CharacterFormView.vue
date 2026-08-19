<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'

/**
 * Create/edit form for a single character. Handles every Character field
 * except the generic `data` map. Props come from the route: `id` is `'new'`
 * for create mode, or an existing character id for edit mode.
 *
 * Layout mirrors QuickWriteView: a header toolbar, a large description editor
 * as the main working area, and the remaining fields in a form sidebar.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.characters.find((c) => c.id === props.id) ?? null
    : null,
)

// Initialise the form from the character being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const firstName = ref(existing.value?.firstName ?? '')
const lastName = ref(existing.value?.lastName ?? '')
const isFemale = ref(existing.value?.isFemale ?? false)
const birthdate = ref(existing.value?.birthdate ?? '')
const aliasesText = ref(existing.value?.aliases.join(', ') ?? '')
const description = ref(existing.value?.description ?? '')
const universeId = ref(existing.value?.universeId ?? '')

const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

const title = computed(() => (isEdit.value ? 'Edit Character' : 'New Character'))

// Auto-grows the description textarea so it expands with its content.
function growTextarea(el: HTMLElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}
const vAutoGrow = {
  mounted: (el: HTMLElement) => growTextarea(el),
  updated: (el: HTMLElement) => growTextarea(el),
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'characters')
}

function save() {
  if (!firstName.value.trim()) return

  const character = new Character(
    firstName.value.trim(),
    lastName.value.trim(),
    isFemale.value,
  )
  // If the id is empty, fill it with a fresh UUID.
  character.id = id.value.trim() || crypto.randomUUID()
  character.birthdate = birthdate.value.trim() || null
  character.aliases = aliasesText.value
    .split(',')
    .map((alias) => alias.trim())
    .filter(Boolean)
  character.description = description.value
  character.universeId = universeId.value

  if (isEdit.value) {
    project.value?.characterService.edit(character.id, character)
  } else {
    project.value?.characterService.add(character)
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
          { label: 'Characters', onClick: goBack },
          { label: title },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!firstName.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Character' }}
      </AppButton>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Description editor -->
      <section class="min-w-0 flex-1">
        <textarea
          v-model="description"
          spellcheck="true"
          placeholder="Write the character's description…"
          class="h-full w-full resize-none bg-transparent px-4 py-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
        ></textarea>
      </section>

      <!-- Details sidebar -->
      <aside
        class="w-96 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Details
        </h2>

        <form class="mt-4 space-y-4" @submit.prevent="save">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            First Name
            <AppTextField v-model="firstName" class="mt-1" placeholder="Jane" />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Last Name
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <AppTextField v-model="lastName" class="mt-1" placeholder="Doe" />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Gender
            <select
              v-model="isFemale"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option :value="true">Female</option>
              <option :value="false">Male</option>
            </select>
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Birthdate
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <AppTextField v-model="birthdate" class="mt-1" placeholder="YYYY-MM-DD" />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Aliases
            <span class="font-normal text-slate-400 dark:text-slate-500">
              (optional, comma-separated)
            </span>
            <AppTextField
              v-model="aliasesText"
              class="mt-1"
              placeholder="Jane Doe, The Doctor, J"
            />
          </label>

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
        </form>
      </aside>
    </div>
  </main>
</template>
