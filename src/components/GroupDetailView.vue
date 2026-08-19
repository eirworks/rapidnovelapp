<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import type { Group, GroupType } from '../libs/models/Group'
import type { Character } from '../libs/models/Character'
import type { Place } from '../libs/models/Place'
import type { Item } from '../libs/models/Item'
import type { Universe } from '../libs/models/Universe'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

/**
 * Read-only detail view for a single group: shows its info and the list of its
 * members. Each member links to its own page (character/place/item).
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string, params?: Record<string, string>] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const group = computed<Group | null>(
  () => project.value?.database.groups.find((g) => g.id === props.id) ?? null,
)

const characters = computed<Character[]>(() => project.value?.database.characters ?? [])
const places = computed<Place[]>(() => project.value?.database.places ?? [])
const items = computed<Item[]>(() => project.value?.database.items ?? [])

/** Universes available to resolve the group's universe name. */
const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

/** Display name of the group's universe, or null when unassigned. */
const universeName = computed<string | null>(() => {
  const universeId = group.value?.universeId
  if (!universeId) return null
  return universes.value.find((u) => u.id === universeId)?.name ?? null
})
/** Tailwind badge classes per group type, for both light and dark themes. */
const typeStyles: Record<GroupType, string> = {
  character: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  place: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  item: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

/** A resolved member of the group, with the label to display and the route to navigate to. */
const members = computed<{ id: string; label: string; view: string }[]>(() => {
  if (!group.value) return []
  const memberIds = group.value.memberIds
  switch (group.value.type) {
    case 'character':
      return characters.value
        .filter((c) => memberIds.includes(c.id))
        .map((c) => ({
          id: c.id,
          label: [c.firstName, c.lastName].filter(Boolean).join(' '),
          view: 'character-edit',
        }))
    case 'place':
      return places.value
        .filter((p) => memberIds.includes(p.id))
        .map((p) => ({ id: p.id, label: p.name, view: 'place-edit' }))
    case 'item':
      return items.value
        .filter((i) => memberIds.includes(i.id))
        .map((i) => ({ id: i.id, label: i.name, view: 'item-edit' }))
  }
})

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'groups')
}

function editGroup() {
  if (!group.value) return
  emit('navigate', 'group-edit', { id: group.value.id })
}

function openMember(view: string, id: string) {
  emit('navigate', view, { id })
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
          { label: 'Home', onClick: goHome },
          { label: 'Groups', onClick: goBack },
          { label: group?.name || 'Group' },
        ]"
      />
      <span class="flex-1"></span>
      <AppButton @click="editGroup" :disabled="!group">
        <VueIcon name="bs:pencil-square" />
        Edit
      </AppButton>
    </header>

    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <template v-if="group">
        <div class="mx-auto w-full max-w-3xl space-y-6">
          <!-- Group info -->
          <header
            class="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="min-w-0">
              <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {{ group.name }}
              </h2>
              <p
                v-if="universeName"
                class="mt-1 text-sm text-emerald-600 dark:text-emerald-400"
              >
                {{ universeName }}
              </p>
              <p
                v-if="group.description"
                class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300"
              >
                {{ group.description }}
              </p>
              <p
                v-else
                class="mt-2 text-sm text-slate-400 dark:text-slate-500"
              >
                No description yet.
              </p>
            </div>
            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
              :class="typeStyles[group.type]"
            >
              {{ group.type }}
            </span>
          </header>

          <!-- Members -->
          <section
            class="rounded-lg border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Members
              <span class="font-normal normal-case">
                ({{ members.length }})
              </span>
            </h3>

            <ul v-if="members.length > 0" class="mt-3 space-y-1">
              <li
                v-for="member in members"
                :key="member.id"
                class="rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200"
                  :title="`Open ${member.label}`"
                  @click="openMember(member.view, member.id)"
                >
                  <span class="text-slate-400 dark:text-slate-500">
                    <VueIcon name="bs:box-arrow-up-right" />
                  </span>
                  <span class="flex-1 font-medium">{{ member.label }}</span>
                </button>
              </li>
            </ul>
            <p
              v-else
              class="mt-3 text-sm text-slate-400 dark:text-slate-500"
            >
              This group has no members yet.
            </p>
          </section>
        </div>
      </template>

      <!-- Empty state when the group does not exist -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          Group not found.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up for the toolbar and member link icons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
