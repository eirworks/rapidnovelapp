<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import type { Character } from '../libs/models/Character'
import type { Event as TimelineEvent } from '../libs/models/Event'

export interface EventFormPayload {
  id: string | null
  name: string
  description: string
  actorIds: string[]
  date: string
}

const props = defineProps<{
  event: TimelineEvent | null
  timelineId: string
  characters: Character[]
}>()

const emit = defineEmits<{
  save: [payload: EventFormPayload]
  cancel: []
}>()

const isEdit = computed(() => props.event !== null)
const name = ref(props.event?.name ?? '')
const description = ref(props.event?.description ?? '')
const actorIds = ref<string[]>(props.event?.actorIds ?? [])
const date = ref(props.event?.date ?? '')
const title = computed(() => (isEdit.value ? 'Edit Event' : 'New Event'))

function submit() {
  if (!name.value.trim() || !date.value) return
  emit('save', {
    id: props.event?.id ?? null,
    name: name.value.trim(),
    description: description.value.trim(),
    actorIds: actorIds.value,
    date: date.value,
  })
}
</script>

<template>
  <AppModal :title="title" @close="emit('cancel')">
    <form class="mt-4 space-y-4 text-left" @submit.prevent="submit">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Name
        <AppTextField v-model="name" class="mt-1" placeholder="The battle begins" />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Date
        <input
          v-model="date"
          type="date"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
        />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Description
        <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        <AppTextField
          v-model="description"
          class="mt-1"
          multiline
          :rows="4"
          placeholder="What happened?"
        />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Actors
        <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        <select
          v-model="actorIds"
          multiple
          class="mt-1 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
        >
          <option v-for="character in characters" :key="character.id" :value="character.id">
            {{ [character.firstName, character.lastName].filter(Boolean).join(' ') }}
          </option>
        </select>
        <span class="mt-1 block text-xs font-normal text-slate-400 dark:text-slate-500">
          Hold Ctrl or Cmd to select multiple characters.
        </span>
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <AppButton variant="bordered" @click="emit('cancel')">Cancel</AppButton>
        <AppButton type="submit" :disabled="!name.trim() || !date">
          {{ isEdit ? 'Save Changes' : 'Add Event' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
