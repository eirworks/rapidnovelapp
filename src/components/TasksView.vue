<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import TaskModal, { type TaskFormPayload } from './TaskModal.vue'
import TaskGroupsModal from './TaskGroupsModal.vue'
import type { TaskGroupFormPayload } from './TaskGroupModal.vue'
import { Task, type TaskStatus } from '../libs/models/management/Task'
import type { Task as TaskModel } from '../libs/models/management/Task'
import type { TaskGroup } from '../libs/models/TaskGroup'
import { useProjectStore } from '../store/projects'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

defineEmits<{ back: [] }>()

const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)

/** Whether the task create/edit modal is shown. */
const taskModal = ref(false)
/** The task being edited in the modal, or null for a new task. */
const editingTask = ref<TaskModel | null>(null)
/** Whether the "Manage Groups" modal is shown. */
const groupsModal = ref(false)
/** Id of the task awaiting delete confirmation. */
const confirmDeleteId = ref<string | null>(null)

const tasks = computed<TaskModel[]>(
  () => project.value?.management.tasks ?? [],
)

const groups = computed<TaskGroup[]>(
  () => project.value?.database.taskGroups ?? [],
)

/** Resolves a group id to its display name, or null when unknown. */
function groupName(groupId: string | null): string | null {
  if (!groupId) return null
  return groups.value.find((g) => g.id === groupId)?.name ?? null
}

/** Tailwind classes per status, chosen for both light and dark themes. */
const statusStyles: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  working: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  finished: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

function openNewTask() {
  editingTask.value = null
  taskModal.value = true
}

function openEditTask(task: TaskModel) {
  editingTask.value = task
  taskModal.value = true
}

function onTaskSave(payload: TaskFormPayload) {
  const task = new Task(payload.task, payload.status)
  if (payload.id) task.id = payload.id
  task.description = payload.description.trim() || null
  task.dueDate = payload.dueDate || null
  task.groupId = payload.groupId || null

  if (payload.id) {
    project.value?.taskService.edit(task.id, task)
  } else {
    project.value?.taskService.add(task)
  }
  taskModal.value = false
}

/** Toggles a task between `pending` and `finished` (no-op for other statuses). */
function toggleFinished(task: TaskModel) {
  if (task.status === 'finished') {
    project.value?.taskService.edit(task.id, { ...task, status: 'pending' })
  } else if (task.status === 'pending') {
    project.value?.taskService.edit(task.id, { ...task, status: 'finished' })
  }
}

function confirmDeleteTask(task: TaskModel) {
  confirmDeleteId.value = task.id
}

function doDeleteTask() {
  if (!confirmDeleteId.value) return
  project.value?.taskService.delete(confirmDeleteId.value)
  confirmDeleteId.value = null
}

function onGroupSave(payload: TaskGroupFormPayload) {
  if (payload.id) {
    const existing = groups.value.find((g) => g.id === payload.id)
    if (existing) {
      project.value?.taskGroupService.edit(existing.id, {
        ...existing,
        name: payload.name,
        description: payload.description.trim() || null,
        dueDate: payload.dueDate || null,
      })
    }
  } else {
    project.value?.taskGroupService.add({
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description.trim() || null,
      dueDate: payload.dueDate || null,
    } as TaskGroup)
  }
}

function onGroupDelete(id: string) {
  project.value?.taskGroupService.delete(id)
  // Release any task that referenced the deleted group.
  tasks.value.forEach((task) => {
    if (task.groupId === id) {
      project.value?.taskService.edit(task.id, { ...task, groupId: null })
    }
  })
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
          { label: 'Home', onClick: () => $emit('back') },
          { label: 'Tasks' },
        ]"
      />
      <span class="flex-1"></span>
      <AppButton variant="bordered" @click="groupsModal = true">
        <VueIcon name="bs:tag" />
        Manage Groups
      </AppButton>
      <AppButton @click="openNewTask">
        <VueIcon name="bs:plus-lg" />
        New Task
      </AppButton>
    </header>

    <!-- Task list -->
    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <ul v-if="tasks.length > 0" class="mx-auto w-full max-w-3xl space-y-2">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
        >
          <!-- Checkbox toggles pending <-> finished -->
          <button
            type="button"
            class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border border-slate-300 text-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600"
            :class="
              task.status === 'finished'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            "
            :title="task.status === 'finished' ? 'Mark as pending' : 'Mark as finished'"
            @click="toggleFinished(task)"
          >
            <VueIcon v-if="task.status === 'finished'" name="bs:check-lg" />
          </button>

          <span
            class="min-w-0 flex-1 text-sm"
            :class="
              task.status === 'finished' || task.status === 'cancelled'
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-100'
            "
          >
            {{ task.task }}
          </span>

          <!-- Status badge -->
          <span
            class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            :class="statusStyles[task.status]"
          >
            {{ task.status }}
          </span>

          <!-- Group badge shown on the right side of the task -->
          <span
            v-if="groupName(task.groupId)"
            class="shrink-0 rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            {{ groupName(task.groupId) }}
          </span>

          <!-- Row actions -->
          <div class="flex shrink-0 items-center gap-1">
            <template v-if="confirmDeleteId === task.id">
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold bg-red-600 text-white transition hover:bg-red-700"
                @click="doDeleteTask"
              >
                Delete
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                @click="confirmDeleteId = null"
              >
                Cancel
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
                title="Edit task"
                @click="openEditTask(task)"
              >
                <VueIcon name="bs:pencil-square" />
              </button>
              <button
                type="button"
                class="flex cursor-pointer items-center rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
                title="Delete task"
                @click="confirmDeleteTask(task)"
              >
                <VueIcon name="bs:trash" />
              </button>
            </template>
          </div>
        </li>
      </ul>

      <div
        v-else
        class="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No tasks yet. Add your first task to get started.
        </p>
      </div>
    </section>
  </main>

  <TaskModal
    v-if="taskModal"
    :task="editingTask"
    :groups="groups"
    @save="onTaskSave"
    @cancel="taskModal = false"
  />

  <TaskGroupsModal
    v-if="groupsModal"
    :groups="groups"
    @close="groupsModal = false"
    @save="onGroupSave"
    @delete="onGroupDelete"
  />
</template>

<style scoped>
/* Scale VueIcon svgs up for the toolbar and row action buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
