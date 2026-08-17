<script setup lang="ts">
import { ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import TaskGroupModal, { type TaskGroupFormPayload } from './TaskGroupModal.vue'
import type { TaskGroup } from '../libs/models/TaskGroup'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineProps<{ groups: TaskGroup[] }>()

const emit = defineEmits<{
  close: []
  save: [payload: TaskGroupFormPayload]
  delete: [id: string]
}>()

/** Whether the add/edit group form modal is shown. */
const groupModal = ref(false)
/** The group being edited in the form modal, or null for a new group. */
const editingGroup = ref<TaskGroup | null>(null)

function openNew() {
  editingGroup.value = null
  groupModal.value = true
}

function openEdit(group: TaskGroup) {
  editingGroup.value = group
  groupModal.value = true
}

function onSave(payload: TaskGroupFormPayload) {
  emit('save', payload)
  groupModal.value = false
}
</script>

<template>
  <AppModal title="Task Groups" :close-on-overlay="false" @close="emit('close')">
    <div class="mt-4 text-left">
      <p v-if="groups.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        No groups yet. Create one to organize your tasks.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="group in groups"
          :key="group.id"
          class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
              {{ group.name }}
            </p>
            <p v-if="group.description" class="truncate text-xs text-slate-400 dark:text-slate-500">
              {{ group.description }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
              title="Edit group"
              @click="openEdit(group)"
            >
              <VueIcon name="bs:pencil-square" />
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
              title="Delete group"
              @click="emit('delete', group.id)"
            >
              <VueIcon name="bs:trash" />
            </button>
          </div>
        </li>
      </ul>

      <AppButton class="mt-4" block @click="openNew">
        <VueIcon name="bs:plus-lg" />
        New Group
      </AppButton>
    </div>
  </AppModal>

  <TaskGroupModal
    v-if="groupModal"
    :group="editingGroup"
    @save="onSave"
    @cancel="groupModal = false"
  />
</template>

<style scoped>
/* Scale VueIcon svgs up for the action buttons. */
button svg {
  width: 1rem;
  height: 1rem;
}
</style>
