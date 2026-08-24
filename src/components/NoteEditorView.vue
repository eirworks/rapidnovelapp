<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Note } from '../libs/models/management/Note'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

/**
 * Full-page editor for a single note. Props come from the route: `id` is
 * `'new'` for create mode, or an existing note id for edit mode.
 *
 * The title is a large, document-style field and the content is an auto-growing
 * textarea that expands with the note's length — a comfortable canvas for
 * longer notes, unlike the small modal used before.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.management.notes.find((n) => n.id === props.id) ?? null
    : null,
)

// Initialise the form from the note being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const title = ref(existing.value?.title ?? '')
const content = ref(existing.value?.content ?? '')

/** Breadcrumb label: the note's title in edit mode, or "New Note". */
const titleText = computed(() =>
  isEdit.value ? (existing.value?.title ?? 'Note') : 'New Note',
)

// Auto-grows the content textarea so it expands with its content (no height
// limit). The CSS min-height keeps the box at least a full screen tall.
function growTextarea(el: HTMLElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}
const vAutoGrow = {
  mounted: (el: HTMLElement) => growTextarea(el),
  updated: (el: HTMLElement) => growTextarea(el),
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'notes')
}

function save() {
  if (!title.value.trim()) return

  const note = new Note(title.value.trim(), content.value.trim())
  // If the id is empty, fill it with a fresh UUID.
  note.id = id.value.trim() || crypto.randomUUID()

  if (isEdit.value) {
    project.value?.noteService.edit(note.id, note)
  } else {
    project.value?.noteService.add(note)
  }

  goBack()
}

function confirmDelete() {
  if (!isEdit.value || !existing.value) return
  if (!window.confirm('Delete this note? This cannot be undone.')) return
  project.value?.noteService.delete(existing.value.id)
  goBack()
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
          { label: 'Notes', onClick: goBack },
          { label: titleText },
        ]"
      />
      <span class="flex-1"></span>

      <AppButton
        v-if="isEdit"
        variant="danger"
        @click="confirmDelete"
      >
        <VueIcon name="bs:trash" />
        Delete
      </AppButton>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton :disabled="!title.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Note' }}
      </AppButton>
    </header>

    <!-- Editor -->
    <section class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <div class="mx-auto w-full max-w-3xl">
        <!-- Document-style title field -->
        <input
          v-model="title"
          spellcheck="true"
          placeholder="Note title"
          class="w-full border-none bg-transparent text-3xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-600"
          @keydown.enter.prevent="save"
        />

        <!-- Large auto-growing content area -->
        <textarea
          v-model="content"
          v-auto-grow
          spellcheck="true"
          placeholder="Start writing your note…"
          class="mt-4 w-full min-h-[60vh] resize-none border-none bg-transparent text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        ></textarea>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up to match the toolbar buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
