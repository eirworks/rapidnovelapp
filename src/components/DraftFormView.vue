<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import Breadcrumb from './ui/Breadcrumb.vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import { AI_ACTIONS } from '../libs/models/AiAction'
import type { AiAction } from '../libs/models/AiAction'
import { DraftDocument } from '../libs/models/DraftDocument'
import type { DraftItem } from '../libs/models/DraftItem'
import { Chapter } from '../libs/models/Chapter'
import type { Story } from '../libs/models/Story'
import { useProjectStore } from '../store/projects'
import { useStatusBarStore } from '../store/statusBar'

/**
 * Full-page editor for a single draft. Drafts live outside the in-memory
 * project graph — each one is a file `projects/<id>/drafts/<draftId>.json`
 * managed through `window.draftApi`.
 *
 * The layout mirrors QuickWriteView (notebook cells + AI panel) but drops its
 * New/Load/Save-as-TXT toolbar: the draft is saved to its fixed file path and
 * can be turned into a story chapter with "Publish as Chapter".
 */
const props = withDefaults(defineProps<{ id?: string }>(), { id: 'new' })

const emit = defineEmits<{
  back: []
  navigate: [view: string, params?: Record<string, string>]
}>()

// ---------------- Draft state ----------------
const projectStore = useProjectStore()
const { project } = storeToRefs(projectStore)
const statusBar = useStatusBarStore()

const projectId = computed(() => project.value?.id ?? '')
const stories = computed<Story[]>(() => project.value?.content.stories ?? [])
const isEdit = computed(() => props.id !== 'new' && !!props.id)

const document = ref(new DraftDocument())
const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')

/** Breadcrumb label: the draft's title in edit mode, or "New Draft". */
const titleText = computed(() =>
  isEdit.value ? (document.value.title.trim() || 'Draft') : 'New Draft',
)

// ---------------- AI provider state ----------------
const aiLoading = ref(true)
const providers = ref<AiProvider[]>([])
const providerId = ref('')
const model = ref('')
const aiError = ref('')
const runningItemId = ref<string | null>(null)
const runningActionId = ref('')

// Auto-grows item textareas so cells expand with their content (no height limit).
function growTextarea(el: HTMLElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}
const vAutoGrow = {
  mounted: (el: HTMLElement) => growTextarea(el),
  updated: (el: HTMLElement) => growTextarea(el),
}

const selectedProvider = computed(() =>
  providers.value.find((p) => p.id === providerId.value),
)
const availableModels = computed(() => selectedProvider.value?.models ?? [])
const canRunAi = computed(
  () =>
    !runningItemId.value &&
    !!selectedProvider.value?.apiKey &&
    model.value !== '',
)

function isRunning(item: DraftItem, action: AiAction): boolean {
  return (
    runningItemId.value === item.id && runningActionId.value === action.id
  )
}

onMounted(async () => {
  try {
    const config = await window.configApi.get()
    providers.value = config.aiProviders
    if (providers.value.length > 0) {
      providerId.value = providers.value[0].id
      model.value = providers.value[0].models[0] ?? ''
    }
  } catch {
    aiError.value = 'Could not load AI providers.'
  } finally {
    aiLoading.value = false
  }

  if (isEdit.value) {
    try {
      const { content } = await window.draftApi.load(projectId.value, props.id)
      document.value = parseDraft(content)
    } catch {
      error.value = 'Could not load the draft.'
    } finally {
      loading.value = false
    }
  } else {
    // A brand-new draft starts with a single empty cell to write in.
    document.value.addItem('')
  }
})

watch(providerId, (id) => {
  const provider = providers.value.find((p) => p.id === id)
  model.value = provider?.models[0] ?? ''
})

// ---------------- File actions ----------------
function serializeDraft(): string {
  return JSON.stringify(document.value.toJSON(), null, 2)
}

/** Parses a loaded draft file, falling back to plain text for old files. */
function parseDraft(content: string): DraftDocument {
  try {
    const doc = DraftDocument.fromJSON(JSON.parse(content))
    if (doc.items.length === 0) doc.addItem('')
    return doc
  } catch {
    // Legacy/plain-text file: treat the whole content as a single item.
    const doc = new DraftDocument()
    doc.addItem(content)
    return doc
  }
}

/** Persists the draft to `drafts/<draftId>.json` under the project. */
async function saveDraft() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    await window.draftApi.save(
      projectId.value,
      document.value.id,
      serializeDraft(),
    )
    statusBar.success('Draft saved')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save the draft.'
  } finally {
    saving.value = false
  }
}

/** Combined item texts, used as the body when publishing a chapter. */
function combinedText(): string {
  return document.value.items
    .map((item) => item.data.trimEnd())
    .filter((text) => text.length > 0)
    .join('\n\n')
}

/**
 * Turns the draft into a chapter of the selected story. Chapters cannot be
 * created or edited directly anywhere else — publishing a draft is the only
 * creation path. The draft file itself is kept so it can be revised later.
 */
async function publishAsChapter() {
  const projectValue = project.value
  const doc = document.value
  if (!projectValue) return

  const storyId = doc.storyId
  const title = doc.title.trim()
  const content = combinedText()
  if (!storyId) {
    error.value = 'Pick a story before publishing.'
    return
  }
  if (!stories.value.some((s) => s.id === storyId)) {
    error.value = 'The selected story no longer exists.'
    return
  }
  if (!title) {
    error.value = 'Give the draft a title before publishing.'
    return
  }
  if (!content) {
    error.value = 'The draft is empty — nothing to publish.'
    return
  }

  // Save first so the draft file reflects exactly what is being published.
  error.value = ''
  try {
    await window.draftApi.save(projectId.value, doc.id, serializeDraft())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save the draft.'
    return
  }

  const storyChapters = projectValue.content.chapters.filter(
    (c) => c.storyId === storyId,
  )
  const number =
    storyChapters.reduce((max, c) => Math.max(max, c.number), 0) + 1

  const chapter = new Chapter(storyId, title)
  chapter.number = number
  chapter.content = content
  projectValue.chapterService.add(chapter)

  statusBar.success(`Published "${title}" as Chapter ${number}`)
}

/** Deletes the draft file and returns to the drafts list. */
async function deleteDraft() {
  if (!isEdit.value || saving.value) return
  if (!window.confirm('Delete this draft? This cannot be undone.')) return
  error.value = ''
  try {
    await window.draftApi.delete(projectId.value, props.id)
    emit('navigate', 'draft')
  } catch {
    error.value = 'Could not delete the draft.'
  }
}

function goHome() {
  emit('back')
}

function goBack() {
  emit('navigate', 'draft')
}

// ---------------- Item operations ----------------
function addItemAfter(id?: string) {
  if (!id) {
    document.value.addItem('')
    return
  }
  const index = document.value.items.findIndex((item) => item.id === id)
  document.value.addItem('', index + 1)
}

function removeItem(id: string) {
  if (runningItemId.value === id) return
  document.value.removeItem(id)
}

function undoItem(item: DraftItem) {
  if (runningItemId.value === item.id) return
  item.undo()
}

// ---------------- AI actions ----------------
async function runAction(item: DraftItem, action: AiAction) {
  if (!canRunAi.value) return
  const text = item.data.trim()
  if (!text) return
  runningItemId.value = item.id
  runningActionId.value = action.id
  aiError.value = ''
  try {
    const result = await window.aiApi.run({
      providerId: providerId.value,
      model: model.value,
      systemPrompt: action.systemPrompt,
      text: item.data,
    })
    // Any action immediately edits the content; the pre-action content is
    // kept on the item so it can be recovered with one undo step.
    item.applyAction(action, result)
  } catch (e) {
    aiError.value = e instanceof Error ? e.message : 'The AI request failed.'
  } finally {
    runningItemId.value = null
    runningActionId.value = ''
  }
}

// ---------------- Drag-to-reorder ----------------
const dragId = ref<string | null>(null)

function onDragStart(item: DraftItem) {
  dragId.value = item.id
}

function onDragEnd() {
  dragId.value = null
}

function onDragOver(target: DraftItem) {
  if (!dragId.value || dragId.value === target.id) return
  document.value.moveItem(dragId.value, target.id)
  dragId.value = target.id
}

function onDrop() {
  dragId.value = null
}
</script>

<template>
  <main class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <!-- Header: no New/Load/TXT toolbar — save + publish are the only actions -->
    <header
      class="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <Breadcrumb
        :crumbs="[
          { label: 'Home', onClick: goHome },
          { label: 'Drafts', onClick: goBack },
          { label: titleText },
        ]"
      />

      <span class="flex-1"></span>

      <!-- Story selector: needed to publish the draft as a chapter -->
      <select
        v-model="document.storyId"
        :disabled="loading"
        title="Story this draft belongs to"
        class="max-w-48 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
      >
        <option :value="null">No story</option>
        <option v-for="story in stories" :key="story.id" :value="story.id">
          {{ story.title }}
        </option>
      </select>

      <AppButton
        v-if="isEdit"
        variant="danger"
        :disabled="saving"
        @click="deleteDraft"
      >
        <VueIcon name="bs:trash" />
        Delete
      </AppButton>

      <AppButton
        variant="bordered"
        :disabled="saving || loading"
        @click="saveDraft"
      >
        {{ saving ? 'Saving…' : 'Save' }}
      </AppButton>

      <AppButton :disabled="saving || loading" @click="publishAsChapter">
        Publish as Chapter
      </AppButton>

      <span
        v-if="error"
        class="w-full text-right text-sm font-medium text-red-600 dark:text-red-400"
      >
        {{ error }}
      </span>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Notebook -->
      <section class="min-w-0 flex-1 overflow-y-auto">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading draft…
        </div>

        <div v-else class="w-full p-4">
          <!-- Document-style title field -->
          <input
            v-model="document.title"
            spellcheck="true"
            placeholder="Draft title"
            class="w-full border-none bg-transparent px-4 pb-2 text-3xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-600"
            @keydown.enter.prevent="saveDraft"
          />

          <div
            v-for="item in document.items"
            :key="item.id"
            class="group pt-5"
            @dragover.prevent="onDragOver(item)"
            @drop.prevent="onDrop"
          >
            <!-- Drag handle on top -->
            <div class="flex items-center px-2 pb-1">
              <span
                draggable="true"
                title="Drag to reorder"
                class="cursor-grab select-none text-base leading-none text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
                @dragstart="onDragStart(item)"
                @dragend="onDragEnd"
              >
                ⋮⋮
              </span>
              <span
                v-if="runningItemId === item.id"
                class="ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400"
              >
                Running AI action…
              </span>
            </div>

            <!-- Item content: blends with background, highlighted only when active -->
            <textarea
              v-model="item.data"
              v-auto-grow
              spellcheck="true"
              :disabled="!!runningItemId"
              placeholder="Start writing this item…"
              class="w-full rounded-xl bg-transparent px-4 py-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:bg-slate-100 focus:outline-none disabled:cursor-not-allowed dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:bg-slate-800/60"
            ></textarea>

            <!-- Bottom toolbar: AI actions left, add item far right -->
            <div class="flex flex-wrap items-center gap-1 px-1 py-1.5">
              <button
                v-for="action in AI_ACTIONS"
                :key="action.id"
                class="rounded-md px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 dark:disabled:hover:bg-transparent dark:disabled:hover:text-slate-400"
                :disabled="!canRunAi || !item.data.trim() || (!!runningItemId && runningItemId !== item.id)"
                :title="action.description"
                @click="runAction(item, action)"
              >
                {{ isRunning(item, action) ? '…' : action.label }}
              </button>

              <button
                v-if="item.hasUndo"
                class="rounded-md px-2 py-0.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-800"
                title="Undo the last AI action"
                @click="undoItem(item)"
              >
                ↩ Undo
              </button>

              <span class="flex-1"></span>

              <button
                class="rounded-md px-2 py-0.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                title="Delete item"
                :disabled="runningItemId === item.id"
                @click="removeItem(item.id)"
              >
                ✕
              </button>

              <button
                class="rounded-md px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800"
                title="Add an item after this one"
                @click="addItemAfter(item.id)"
              >
                ＋ Add item
              </button>
            </div>
          </div>

          <!-- Empty state: still need a way to add the first item -->
          <div
            v-if="document.items.length === 0"
            class="flex justify-center pt-10"
          >
            <AppButton variant="bordered" @click="addItemAfter()">
              ＋ Add item
            </AppButton>
          </div>
        </div>
      </section>

      <!-- AI panel -->
      <aside
        class="flex w-96 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            AI Assistant
          </h2>
          <AppButton variant="text" size="sm" @click="$emit('navigate', 'settings')">
            Settings
          </AppButton>
        </div>

        <p v-if="aiLoading" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Loading providers…
        </p>

        <template v-else-if="providers.length === 0">
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No AI providers configured yet.
          </p>
          <AppButton variant="bordered" class="mt-3" @click="$emit('navigate', 'settings')">
            Go to Settings
          </AppButton>
        </template>

        <template v-else>
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Pick a provider and model, then use the action buttons on each item.
            The action is applied immediately and can be undone once.
          </p>

          <div class="mt-4 space-y-4">
            <!-- Provider -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Provider
              </label>
              <select
                v-model="providerId"
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
              >
                <option v-for="p in providers" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <!-- Model -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Model
              </label>
              <select
                v-model="model"
                :disabled="availableModels.length === 0"
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
              >
                <option value="" disabled>
                  {{ availableModels.length === 0 ? 'No models — add in Settings' : 'Select a model' }}
                </option>
                <option v-for="m in availableModels" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>

            <p
              v-if="selectedProvider && !selectedProvider.apiKey"
              class="text-xs text-amber-600 dark:text-amber-400"
            >
              This provider has no API key. Set it in Settings.
            </p>

            <p
              v-if="runningItemId"
              class="text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              Running AI action…
            </p>

            <p v-if="aiError" class="text-sm font-medium text-red-600 dark:text-red-400">
              {{ aiError }}
            </p>
          </div>
        </template>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* Scale VueIcon svgs up to match the toolbar buttons. */
svg {
  width: 1rem;
  height: 1rem;
}
</style>
