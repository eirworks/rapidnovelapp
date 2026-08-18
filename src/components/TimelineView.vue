<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import TimelineEventModal, { type EventFormPayload } from './TimelineEventModal.vue'
import { Event as TimelineEvent } from '../libs/models/Event'
import type { Timeline } from '../libs/models/Timeline'
import type { Character } from '../libs/models/Character'
import { useProjectStore } from '../store/projects'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

const props = defineProps<{ id?: string }>()
const emit = defineEmits<{ navigate: [view: string, params?: Record<string, string>]; back: [] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

const timeline = computed<Timeline | null>(
  () => project.value?.database.timelines.find((item) => item.id === props.id) ?? null,
)
const characters = computed<Character[]>(() => project.value?.database.characters ?? [])
const events = computed<TimelineEvent[]>(() =>
  [...(project.value?.database.events ?? [])]
    .filter((event) => event.timelineId === props.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)),
)

const descriptionExpanded = ref(false)
const selectedEvent = ref<TimelineEvent | null>(null)
const eventModalOpen = ref(false)
const editingEvent = ref<TimelineEvent | null>(null)

const hasLongDescription = computed(() => (timeline.value?.description.length ?? 0) > 100)
const displayedDescription = computed(() => {
  const description = timeline.value?.description ?? ''
  return !descriptionExpanded.value && hasLongDescription.value
    ? `${description.slice(0, 100).trimEnd()}…`
    : description
})

function openCreate() {
  editingEvent.value = null
  eventModalOpen.value = true
}

function openEdit(event: TimelineEvent) {
  selectedEvent.value = null
  editingEvent.value = event
  eventModalOpen.value = true
}

function openDetails(event: TimelineEvent) {
  selectedEvent.value = event
}

function saveEvent(payload: EventFormPayload) {
  if (!project.value || !timeline.value) return

  const event = new TimelineEvent(payload.name, timeline.value.id, payload.date)
  event.description = payload.description
  event.actorIds = payload.actorIds

  if (payload.id) {
    event.id = payload.id
    project.value.eventService.edit(payload.id, event)
  } else {
    project.value.eventService.add(event)
  }
  eventModalOpen.value = false
}

function characterName(id: string): string {
  const character = characters.value.find((item) => item.id === id)
  return character
    ? [character.firstName, character.lastName].filter(Boolean).join(' ')
    : 'Unknown character'
}

function formatDate(date: string): string {
  if (!date) return 'No date'
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed)
}
</script>

<template>
  <main class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <header
      class="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: () => emit('back') },
          { label: 'Timelines', onClick: () => emit('navigate', 'timeline') },
          { label: timeline?.name || 'Timeline' },
        ]"
      />
      <span class="flex-1"></span>
      <AppButton :disabled="!timeline" @click="openCreate">
        <VueIcon name="bs:plus-lg" />
        New Event
      </AppButton>
    </header>

    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-8">
      <div v-if="timeline" class="mx-auto w-full max-w-3xl">
        <header class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {{ timeline.name }}
          </h1>
          <div class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <span v-if="displayedDescription">{{ displayedDescription }}</span>
            <span v-else class="text-slate-400 dark:text-slate-500">No description yet.</span>
            <button
              v-if="hasLongDescription"
              type="button"
              class="ml-1 cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
              @click="descriptionExpanded = !descriptionExpanded"
            >
              {{ descriptionExpanded ? 'Read less' : 'Read more' }}
            </button>
          </div>
        </header>

        <section class="mt-8">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Events <span class="font-normal normal-case">({{ events.length }})</span>
            </h2>
          </div>

          <div v-if="events.length" class="space-y-3">
            <button
              v-for="event in events"
              :key="event.id"
              type="button"
              class="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
              @click="openDetails(event)"
            >
              <time class="w-32 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                {{ formatDate(event.date) }}
              </time>
              <span class="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-slate-50">
                {{ event.name }}
              </span>
              <VueIcon name="bs:chevron-right" class="shrink-0 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
          <p v-else class="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No events yet. Add the first event to this timeline.
          </p>
        </section>
      </div>

      <div v-else class="flex h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
        Timeline not found.
      </div>
    </section>
  </main>

  <AppModal v-if="selectedEvent" :title="selectedEvent.name" @close="selectedEvent = null">
    <div class="mt-5 text-left">
      <dl class="divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <div class="flex gap-4 py-3 first:pt-0">
          <dt class="w-24 shrink-0 font-medium text-slate-500 dark:text-slate-400">Date</dt>
          <dd class="text-slate-900 dark:text-slate-50">{{ formatDate(selectedEvent.date) }}</dd>
        </div>
        <div class="flex gap-4 py-3">
          <dt class="w-24 shrink-0 font-medium text-slate-500 dark:text-slate-400">Description</dt>
          <dd class="whitespace-pre-wrap text-slate-900 dark:text-slate-50">
            {{ selectedEvent.description || 'No description.' }}
          </dd>
        </div>
        <div class="flex gap-4 py-3 last:pb-0">
          <dt class="w-24 shrink-0 font-medium text-slate-500 dark:text-slate-400">Actors</dt>
          <dd class="text-slate-900 dark:text-slate-50">
            <span v-if="selectedEvent.actorIds.length">{{ selectedEvent.actorIds.map(characterName).join(', ') }}</span>
            <span v-else class="text-slate-400 dark:text-slate-500">No actors.</span>
          </dd>
        </div>
      </dl>
      <div class="mt-5 flex justify-end gap-2">
        <AppButton variant="bordered" @click="selectedEvent = null">Close</AppButton>
        <AppButton @click="openEdit(selectedEvent)">
          <VueIcon name="bs:pencil-square" />
          Edit
        </AppButton>
      </div>
    </div>
  </AppModal>

  <TimelineEventModal
    v-if="eventModalOpen"
    :event="editingEvent"
    :timeline-id="props.id ?? ''"
    :characters="characters"
    @save="saveEvent"
    @cancel="eventModalOpen = false"
  />
</template>

<style scoped>
svg {
  width: 1rem;
  height: 1rem;
}
</style>
