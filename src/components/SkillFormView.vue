<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Skill, SKILL_TYPES } from '../libs/models/Skill'
import type { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'

/**
 * Create/edit form for a single skill. Handles every Skill field: name, type,
 * description, and the optional owner (a character selection). Props come from
 * the route: `id` is `'new'` for create mode, or an existing skill id for edit.
 *
 * Layout mirrors ItemFormView: a header toolbar, a large description editor as
 * the main working area, and the remaining fields in a form sidebar.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.skills.find((s) => s.id === props.id) ?? null
    : null,
)

/** Characters available for the owner selector. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

// Initialise the form from the skill being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const type = ref(existing.value?.type ?? SKILL_TYPES[0])
const ownerId = ref(existing.value?.ownerId ?? '')
const description = ref(existing.value?.description ?? '')
const universeId = ref(existing.value?.universeId ?? '')

const title = computed(() => (isEdit.value ? 'Edit Skill' : 'New Skill'))

const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'skills')
}

function save() {
  if (!name.value.trim()) return

  const skill = new Skill(name.value.trim(), type.value)
  // If the id is empty, fill it with a fresh UUID.
  skill.id = id.value.trim() || crypto.randomUUID()
  skill.description = description.value
  skill.ownerId = ownerId.value.trim() || null
  skill.universeId = universeId.value

  if (isEdit.value) {
    project.value?.skillService.edit(skill.id, skill)
  } else {
    project.value?.skillService.add(skill)
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
          { label: 'Skills', onClick: goBack },
          { label: title },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Skill' }}
      </AppButton>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Description editor -->
      <section class="min-w-0 flex-1">
        <textarea
          v-model="description"
          spellcheck="true"
          placeholder="Write the skill's description…"
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
            Name
            <AppTextField v-model="name" class="mt-1" placeholder="Swordsmanship" />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Type
            <select
              v-model="type"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option v-for="option in SKILL_TYPES" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Owner
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <select
              v-model="ownerId"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="">None</option>
              <option v-for="character in characters" :key="character.id" :value="character.id">
                {{ fullName(character) }}
              </option>
            </select>
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
