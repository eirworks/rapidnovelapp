<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'
import AppModal from './ui/AppModal.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import { useProjectStore } from '../store/projects'
import { Plot, type ActorRole } from '../libs/models/Plot'
import type { Place } from '../libs/models/Place'
import type { Character } from '../libs/models/Character'
import type { Universe } from '../libs/models/Universe'

/** Preset role options shown in the add-actor modal. */
const ROLE_OPTIONS: { value: ActorRole; label: string }[] = [
    { value: 'main',          label: 'Main' },
    { value: 'protagonist',   label: 'Protagonist' },
    { value: 'antagonist',    label: 'Antagonist' },
    { value: 'support',       label: 'Support' },
    { value: 'other',         label: 'Other' },
]

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    ongoing: 'Ongoing',
    completed: 'Completed',
    discard: 'Discarded',
}

const STATUS_BADGE: Record<string, string> = {
    pending:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    ongoing:   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    discard:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

const ROLE_COLORS: Record<string, string> = {
    main:        'border-l-indigo-500',
    protagonist: 'border-l-violet-500',
    antagonist:  'border-l-rose-500',
    support:     'border-l-amber-500',
    other:       'border-l-slate-400',
}

/**
 * Create/edit form for a single plot. Handles every Plot field: name,
 * description, place, actors (characters with roles), number, and goal.
 * Props come from the route: `id` is `'new'` for create mode, or an
 * existing plot id for edit mode.
 *
 * Layout mirrors GroupFormView: a header toolbar, and a single-column form
 * page with all fields in a card.
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{ navigate: [view: string] }>()

const projectStore = useProjectStore()
const project = computed(() => projectStore.project)

const isEdit = computed(() => props.id !== 'new' && !!props.id)

const existing = computed(() =>
  isEdit.value
    ? project.value?.database.plots.find((p) => p.id === props.id) ?? null
    : null,
)

// Initialise the form from the plot being edited (if any), else blank.
const id = ref(existing.value?.id ?? '')
const name = ref(existing.value?.name ?? '')
const description = ref(existing.value?.description ?? '')
const placeId = ref(existing.value?.placeId ?? '')
const actors = ref<{ id: string; role: ActorRole }[]>(
  existing.value?.actors ?? [],
)
const number = ref<number>(existing.value?.number ?? 0)
const goal = ref(existing.value?.goal ?? '')
const status = ref(existing.value?.status ?? 'pending')
const universeId = ref(existing.value?.universeId ?? '')

const title = computed(() => (isEdit.value ? 'Edit Plot' : 'New Plot'))

const universes = computed<Universe[]>(
  () => project.value?.database.universes ?? [],
)

/** Characters available for the actors modal. */
const characters = computed<Character[]>(
  () => project.value?.database.characters ?? [],
)

/** Places available for the place selector. */
const places = computed<Place[]>(
  () => project.value?.database.places ?? [],
)

function fullName(character: Character): string {
  return [character.firstName, character.lastName].filter(Boolean).join(' ')
}

/* ── Add-Actor Modal State ─────────────────────────────────────────── */
const showAddActor = ref(false)
const selectedCharId = ref('')
const selectedRole = ref<ActorRole>('main')
const customRoleLabel = ref('')

function openAddActor() {
    selectedCharId.value = ''
    selectedRole.value = 'main'
    customRoleLabel.value = ''
    showAddActor.value = true
}

function saveActor() {
    const charId = selectedCharId.value
    if (!charId) return
    // Prevent duplicates.
    if (actors.value.some((a) => a.id === charId)) return
    const roleVal = selectedRole.value === 'other' && customRoleLabel.value.trim()
        ? customRoleLabel.value.trim() as ActorRole
        : selectedRole.value
    actors.value = [...actors.value, { id: charId, role: roleVal }]
    selectedCharId.value = ''
    selectedRole.value = 'main'
    customRoleLabel.value = ''
}

function removeActor(actorId: string) {
    actors.value = actors.value.filter((a) => a.id !== actorId)
}

function goHome() {
  emit('navigate', 'home')
}

function goBack() {
  emit('navigate', 'plots')
}

function save() {
  if (!name.value.trim()) return

  const plot = new Plot(name.value.trim())
  // If the id is empty, fill it with a fresh UUID.
  plot.id = id.value.trim() || crypto.randomUUID()
  plot.description = description.value.trim()
  plot.placeId = placeId.value.trim() || null
  plot.actors = [...actors.value]
  plot.number = number.value
  plot.goal = goal.value.trim()
  plot.status = status.value
  plot.universeId = universeId.value

  if (isEdit.value) {
    project.value?.plotService.edit(plot.id, plot)
  } else {
    project.value?.plotService.add(plot)
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
          { label: 'Plots', onClick: goBack },
          { label: title },
        ]"
      />

      <span class="flex-1"></span>

      <AppButton variant="bordered" @click="goBack">Cancel</AppButton>
      <AppButton type="submit" :disabled="!name.trim()" @click="save">
        {{ isEdit ? 'Save Changes' : 'Create Plot' }}
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
          <AppTextField v-model="name" class="mt-1" placeholder="e.g. The King's Return" />
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="description"
            rows="4"
            spellcheck="true"
            placeholder="Describe the plot…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Goal
          <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          <textarea
            v-model="goal"
            rows="3"
            spellcheck="true"
            placeholder="What does this plot aim to achieve?…"
            class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          ></textarea>
        </label>

        <div class="grid grid-cols-3 gap-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sort Number
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <input
              v-model.number="number"
              type="number"
              min="0"
              step="1"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            />
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
            <select
              v-model="status"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="discard">Discarded</option>
            </select>
          </label>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Place
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            <select
              v-model="placeId"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
            >
              <option value="">None</option>
              <option v-for="place in places" :key="place.id" :value="place.id">
                {{ place.name }}
              </option>
            </select>
          </label>
        </div>

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

        <div>
          <legend class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Characters in this plot
            <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </legend>

          <!-- Actor list / placeholder -->
          <div v-if="actors.length > 0" class="mt-2 space-y-1">
            <div
              v-for="actor in actors"
              :key="actor.id"
              class="flex items-center gap-2 rounded-md border-l-4 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
              :class="ROLE_COLORS[actor.role as string] ?? ROLE_COLORS.other"
            >
              <button
                type="button"
                class="cursor-pointer text-left text-sm text-slate-700 dark:text-slate-200 hover:underline"
                @click="removeActor(actor.id)"
              >
                {{ fullName(characters.find((c) => c.id === actor.id)!) }}
              </button>
              <span
                class="ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                :class="STATUS_BADGE[actor.role as string] ?? STATUS_BADGE.other"
              >
                {{ actor.role }}
              </span>
              <button
                type="button"
                class="ml-1 text-slate-400 transition hover:text-red-500 dark:hover:text-red-400"
                title="Remove character from plot"
                @click="removeActor(actor.id)"
              >
                ×
              </button>
            </div>
          </div>

          <p v-else class="mt-1 text-sm text-slate-400 dark:text-slate-500">
            No characters added yet.
          </p>

          <!-- Add button -->
          <button
            type="button"
            variant="bordered"
            class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            @click="openAddActor()"
          >
            + Add Character
          </button>
        </div>
      </form>
    </section>

    <!-- Modal: select character + role -->
    <AppModal v-if="showAddActor" title="Add Character to Plot" @close="showAddActor = false">
      <div class="space-y-4 text-left">
        <!-- Character picker -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Select Character
          </label>
          <select
            v-model="selectedCharId"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option value="">— choose —</option>
            <option v-for="char in characters" :key="char.id" :value="char.id">
              {{ fullName(char) }}
            </option>
          </select>
        </div>

        <!-- Role picker -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Role in Plot
          </label>
          <select
            v-model="selectedRole"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          >
            <option v-for="opt in ROLE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Custom label (only when 'other') -->
        <div v-if="selectedRole === 'other'">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Custom Label
            <span class="font-normal text-slate-400">(free-form role)</span>
          </label>
          <input
            v-model="customRoleLabel"
            type="text"
            placeholder="e.g. companion, enemy"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
          />
        </div>

        <!-- Preview -->
        <div
          v-if="selectedCharId"
          class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
        >
          <strong>{{ fullName(characters.find((c) => c.id === selectedCharId)!) }}</strong> will be added as
          <strong>{{ selectedRole === 'other' && customRoleLabel.trim() ? customRoleLabel.trim() : selectedRole }}</strong>.
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
          <AppButton variant="bordered" @click="showAddActor = false">Cancel</AppButton>
          <AppButton
            type="submit"
            :disabled="!selectedCharId"
            @click="saveActor"
          >
            Add Character
          </AppButton>
        </div>
      </div>
    </AppModal>
  </main>
</template>