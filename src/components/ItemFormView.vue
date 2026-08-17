<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import { useProjectStore } from '../store/projects'
import { Item, ITEM_TYPES } from '../libs/models/Item'
import type { Character } from '../libs/models/Character'

/**
 * Create/edit form for a single item. Handles every Item field: name, type,
 * description, and the optional owner (a character selection). Props come from
 * the route: `id` is `'new'` for create mode, or an existing item id for edit.
 *
 * Layout mirrors CharacterFormView: a header toolbar, a large description
 * editor as the main working area, and the remaining fields in a form sidebar.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.items.find((i) => i.id === props.id) ?? null
    : null,
)

/** Characters available for the owner selector. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

// Initialise the form from the item being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const type = ref(existing.value?.type ?? ITEM_TYPES[0])
const ownerId = ref(existing.value?.ownerId ?? '')
const description = ref(existing.value?.description ?? '')

const title = computed(() => (isEdit.value ? 'Edit Item' : 'New Item'))

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

function goBack() {
  emit('navigate', 'items')
}

function save() {
  if (!name.value.trim()) return

  const item = new Item(name.value.trim(), type.value)
  // If the id is empty, fill it with a fresh UUID.
  item.id = id.value.trim() || crypto.randomUUID()
  item.description = description.value
  item.ownerId = ownerId.value.trim() || null

  if (isEdit.value) {
    project.value?.itemService.edit(item.id, item)
  } else {
    project.value?.itemService.add(item)
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
      <AppButton variant="text" @click="goBack">← Items</AppButton>

      <h1 class="ml-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {{ title }}
      </h1>

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Item' }}
      </AppButton>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Description editor -->
      <section class="min-w-0 flex-1">
        <textarea
          v-model="description"
          spellcheck="true"
          placeholder="Write the item's description…"
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
            <AppTextField v-model="name" class="mt-1" placeholder="Excalibur" />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Type
            <select
              v-model="type"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option v-for="option in ITEM_TYPES" :key="option" :value="option">
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
        </form>
      </aside>
    </div>
  </main>
</template>
