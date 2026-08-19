<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Group, GROUP_TYPES, type GroupType } from '../libs/models/Group'
import type { Character } from '../libs/models/Character'
import type { Place } from '../libs/models/Place'
import type { Item } from '../libs/models/Item'
import type { Universe } from '../libs/models/Universe'

/**
 * Create/edit form for a single group. Props come from the route: `id` is
 * `'new'` for create mode, or an existing group id for edit mode.
 *
 * Unlike the character/place/item views this is a plain, single-column form
 * page: name, description, type, and a member picker. The member options and
 * the meaning of the selected ids depend on the group's `type`, so the type
 * cannot be changed once a group exists.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.groups.find((g) => g.id === props.id) ?? null
    : null,
)

// Initialise the form from the group being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const type = ref<GroupType>(existing.value?.type ?? GROUP_TYPES[0])
const description = ref(existing.value?.description ?? '')
const memberIds = ref<string[]>(existing.value?.memberIds ?? [])
const universeId = ref(existing.value?.universeId ?? '')

const title = computed(() => (isEdit.value ? 'Edit Group' : 'New Group'))

const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

const characters = computed<Character[]>(() => project.value?.database.characters ?? [])
const places = computed<Place[]>(() => project.value?.database.places ?? [])
const items = computed<Item[]>(() => project.value?.database.items ?? [])

/** Candidates selectable as members, based on the chosen group type. */
const memberOptions = computed<{ id: string; label: string }[]>(() => {
  switch (type.value) {
    case 'character':
      return characters.value.map((c) => ({
        id: c.id,
        label: [c.firstName, c.lastName].filter(Boolean).join(' '),
      }))
    case 'place':
      return places.value.map((p) => ({ id: p.id, label: p.name }))
    case 'item':
      return items.value.map((i) => ({ id: i.id, label: i.name }))
  }
})

const memberNoun = computed<string>(() =>
  type.value === 'character'
    ? 'characters'
    : type.value === 'place'
      ? 'places'
      : 'items',
)

/** Toggles a member id in the selected set. */
function toggleMember(memberId: string) {
  if (memberIds.value.includes(memberId)) {
    memberIds.value = memberIds.value.filter((id) => id !== memberId)
  } else {
    memberIds.value = [...memberIds.value, memberId]
  }
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'groups')
}

function save() {
  if (!name.value.trim()) return

  const group = new Group(name.value.trim(), type.value)
  // If the id is empty, fill it with a fresh UUID.
  group.id = id.value.trim() || crypto.randomUUID()
  group.description = description.value.trim()
  group.memberIds = [...memberIds.value]
  group.universeId = universeId.value

  if (isEdit.value) {
    project.value?.groupService.edit(group.id, group)
  } else {
    project.value?.groupService.add(group)
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
          { label: 'Groups', onClick: goBack },
          { label: title },
        ]"
      />
      <span class="flex-1"></span>
      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Group' }}
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
          <AppTextField v-model="name" class="mt-1" placeholder="e.g. The Fellowship" />
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="description"
            rows="4"
            spellcheck="true"
            placeholder="Short description of the group…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Type
          <span v-if="isEdit" class="font-normal text-slate-400 dark:text-slate-500">
            (cannot be changed)
          </span>
          <select
            v-model="type"
            :disabled="isEdit"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option v-for="option in GROUP_TYPES" :key="option" :value="option">
              {{ option }}
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

        <fieldset>
          <legend class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Members
            <span class="font-normal text-slate-400 dark:text-slate-500">
              ({{ memberNoun }})
            </span>
          </legend>

          <div
            v-if="memberOptions.length > 0"
            class="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-600"
          >
            <label
              v-for="member in memberOptions"
              :key="member.id"
              class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                :checked="memberIds.includes(member.id)"
                @change="toggleMember(member.id)"
              />
              <span class="truncate">{{ member.label }}</span>
            </label>
          </div>
          <p v-else class="mt-1 text-sm text-slate-400 dark:text-slate-500">
            No {{ memberNoun }} available yet.
          </p>
        </fieldset>
      </form>
    </section>
  </main>
</template>
