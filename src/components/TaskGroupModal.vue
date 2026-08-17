<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import type { TaskGroup } from '../libs/models/TaskGroup'

export interface TaskGroupFormPayload {
  id: string | null
  name: string
  description: string
  dueDate: string
}

const props = defineProps<{ group: TaskGroup | null }>()
const emit = defineEmits<{
  save: [payload: TaskGroupFormPayload]
  cancel: []
}>()

const isEdit = computed(() => props.group !== null)

const name = ref(props.group?.name ?? '')
const description = ref(props.group?.description ?? '')
const dueDate = ref(props.group?.dueDate ?? '')

const title = computed(() => (isEdit.value ? 'Edit Group' : 'New Group'))

function submit() {
  if (!name.value.trim()) return
  emit('save', {
    id: props.group?.id ?? null,
    name: name.value.trim(),
    description: description.value,
    dueDate: dueDate.value,
  })
}
</script>

<template>
  <AppModal :title="title" @close="emit('cancel')">
    <form class="mt-4 space-y-4 text-left" @submit.prevent="submit">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Name
        <AppTextField v-model="name" class="mt-1" placeholder="Starks" />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Description
        <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        <AppTextField
          v-model="description"
          class="mt-1"
          multiline
          :rows="3"
          placeholder="Any extra notes…"
        />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Due Date
        <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        <input
          v-model="dueDate"
          type="date"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
        />
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <AppButton variant="bordered" @click="emit('cancel')">Cancel</AppButton>
        <AppButton type="submit" :disabled="!name.trim()">
          {{ isEdit ? 'Save Changes' : 'Add Group' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
