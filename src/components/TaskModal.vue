<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppTextField from './ui/AppTextField.vue'
import { TASK_STATUSES, type TaskStatus } from '../libs/models/Task'
import type { Task } from '../libs/models/Task'
import type { TaskGroup } from '../libs/models/TaskGroup'

export interface TaskFormPayload {
  id: string | null
  task: string
  status: TaskStatus
  description: string
  dueDate: string
  groupId: string
}

const props = defineProps<{ task: Task | null; groups: TaskGroup[] }>()
const emit = defineEmits<{
  save: [payload: TaskFormPayload]
  cancel: []
}>()

const isEdit = computed(() => props.task !== null)

const taskText = ref(props.task?.task ?? '')
const status = ref<TaskStatus>(props.task?.status ?? 'pending')
const description = ref(props.task?.description ?? '')
const dueDate = ref(props.task?.dueDate ?? '')
const groupId = ref(props.task?.groupId ?? '')

const title = computed(() => (isEdit.value ? 'Edit Task' : 'New Task'))

function submit() {
  if (!taskText.value.trim()) return
  emit('save', {
    id: props.task?.id ?? null,
    task: taskText.value.trim(),
    status: status.value,
    description: description.value,
    dueDate: dueDate.value,
    groupId: groupId.value,
  })
}
</script>

<template>
  <AppModal :title="title" @close="emit('cancel')">
    <form class="mt-4 space-y-4 text-left" @submit.prevent="submit">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Task
        <AppTextField
          v-model="taskText"
          class="mt-1"
          placeholder="Write plot for Sansa Stark marriage"
        />
      </label>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Status
        <select
          v-model="status"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
        >
          <option v-for="option in TASK_STATUSES" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
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

      <div class="grid grid-cols-2 gap-4">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Due Date
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <input
            v-model="dueDate"
            type="date"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          />
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Group
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <select
            v-model="groupId"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option value="">None</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <AppButton variant="bordered" @click="emit('cancel')">Cancel</AppButton>
        <AppButton type="submit" :disabled="!taskText.trim()">
          {{ isEdit ? 'Save Changes' : 'Add Task' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
