<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import { useProjectStore } from '../store/projects'
import { Character } from '../libs/models/Character'

/**
 * Create/edit form for a single character. Handles every Character field
 * except the generic `data` map. Props come from the route: `id` is `'new'`
 * for create mode, or an existing character id for edit mode.
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

const title = computed(() => (isEdit.value ? 'Edit Character' : 'New Character'))

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

  if (isEdit.value) {
    projectStore.editCharacter(character)
  } else {
    projectStore.addCharacter(character)
  }

  goBack()
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-8 dark:bg-slate-950"
  >
    <div class="w-full max-w-xl">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <AppButton variant="text" size="sm" @click="goBack">← Characters</AppButton>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {{ title }}
        </h1>
        <span class="w-20"></span>
      </div>

      <form class="mt-6" @submit.prevent="save">
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Details
          </h2>
          <div class="mt-4 space-y-4">
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
              Description
              <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
              <AppTextField
                v-model="description"
                multiline
                :rows="6"
                class="mt-1"
                placeholder="Write the character's description…"
              />
            </label>
          </div>
        </section>

        <div class="flex justify-end gap-3 pt-4">
          <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
          <AppButton type="submit" :disabled="!firstName.trim()">
            {{ isEdit ? 'Save Changes' : 'Create Character' }}
          </AppButton>
        </div>
      </form>
    </div>
  </main>
</template>
