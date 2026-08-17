<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Place } from '../libs/models/Place'

/**
 * Create/edit form for a single place. Handles every Place field except the
 * `parentId` (deferred for now). Props come from the route: `id` is `'new'`
 * for create mode, or an existing place id for edit mode.
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
    ? project.value?.database.places.find((p) => p.id === props.id) ?? null
    : null,
)

// Initialise the form from the place being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const description = ref(existing.value?.description ?? '')

const title = computed(() => (isEdit.value ? 'Edit Place' : 'New Place'))

// Auto-grows the description textarea so it expands with its content.
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
  emit('navigate', 'places')
}

function save() {
  if (!name.value.trim()) return

  const place = new Place(name.value.trim())
  // If the id is empty, fill it with a fresh UUID.
  place.id = id.value.trim() || crypto.randomUUID()
  place.description = description.value

  if (isEdit.value) {
    project.value?.placeService.edit(place.id, place)
  } else {
    project.value?.placeService.add(place)
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
          { label: 'Places', onClick: goBack },
          { label: title },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Place' }}
      </AppButton>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Description editor -->
      <section class="min-w-0 flex-1">
        <textarea
          v-model="description"
          spellcheck="true"
          placeholder="Write the place's description…"
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
            <AppTextField v-model="name" class="mt-1" placeholder="Paris" />
          </label>
        </form>
      </aside>
    </div>
  </main>
</template>
