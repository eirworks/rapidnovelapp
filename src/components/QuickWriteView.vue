<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from './ui/AppButton.vue'
import { AI_ACTIONS, getAiAction } from '../libs/models/AiAction'
import { useQuickWriteStore } from '../store/quickWrite'

defineEmits<{ back: []; navigate: [view: string] }>()

// ---------------- Editor state ----------------
const quickWriteStore = useQuickWriteStore()
const { text, currentPath } = storeToRefs(quickWriteStore)
const fileBusy = ref(false)
const fileError = ref('')

// ---------------- AI panel state ----------------
const aiLoading = ref(true)
const providers = ref<AiProvider[]>([])
const providerId = ref('')
const actionId = ref('expand')
const model = ref('')
const running = ref(false)
const output = ref('')
const aiError = ref('')

const selectedProvider = computed(() =>
  providers.value.find((p) => p.id === providerId.value),
)
const availableModels = computed(() => selectedProvider.value?.models ?? [])
const selectedAction = computed(() => getAiAction(actionId.value))
const canRun = computed(
  () =>
    !running.value &&
    text.value.trim().length > 0 &&
    !!selectedProvider.value?.apiKey &&
    model.value !== '',
)

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
})

watch(providerId, (id) => {
  const provider = providers.value.find((p) => p.id === id)
  model.value = provider?.models[0] ?? ''
})

// ---------------- File actions ----------------
function newDraft() {
  if (text.value.trim() && !window.confirm('Discard the current text and start a new draft?')) {
    return
  }
  quickWriteStore.reset()
  output.value = ''
  aiError.value = ''
  fileError.value = ''
}

async function loadDraft() {
  fileBusy.value = true
  fileError.value = ''
  try {
    const result = await window.quickWriteApi.load()
    if (result) {
      text.value = result.content
      currentPath.value = result.path
      output.value = ''
    }
  } catch {
    fileError.value = 'Could not load the file.'
  } finally {
    fileBusy.value = false
  }
}

async function saveDraft() {
  fileBusy.value = true
  fileError.value = ''
  try {
    const result = await window.quickWriteApi.save(text.value)
    if (result) currentPath.value = result.path
  } catch {
    fileError.value = 'Could not save the file.'
  } finally {
    fileBusy.value = false
  }
}

// ---------------- AI actions ----------------
async function runAi() {
  if (!canRun.value || !selectedAction.value) return
  running.value = true
  aiError.value = ''
  try {
    output.value = await window.aiApi.run({
      providerId: providerId.value,
      model: model.value,
      systemPrompt: selectedAction.value.systemPrompt,
      text: text.value,
    })
  } catch (e) {
    aiError.value = e instanceof Error ? e.message : 'The AI request failed.'
  } finally {
    running.value = false
  }
}

function applyOutput() {
  if (!output.value.trim()) return
  text.value = output.value
}
</script>

<template>
  <main class="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <!-- Toolbar -->
    <header
      class="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <AppButton variant="text" @click="$emit('back')">← Home</AppButton>

      <AppButton variant="bordered" :disabled="fileBusy" @click="newDraft">
        New
      </AppButton>
      <AppButton variant="bordered" :disabled="fileBusy" @click="loadDraft">
        {{ fileBusy ? 'Loading…' : 'Load' }}
      </AppButton>
      <AppButton variant="primary" :disabled="fileBusy" @click="saveDraft">
        {{ fileBusy ? 'Saving…' : 'Save' }}
      </AppButton>

      <span
        class="ml-2 truncate font-mono text-xs text-slate-500 dark:text-slate-400"
        :title="currentPath ?? undefined"
      >
        {{ currentPath ? currentPath : 'Unsaved draft' }}
      </span>

      <span v-if="fileError" class="ml-auto text-sm font-medium text-red-600 dark:text-red-400">
        {{ fileError }}
      </span>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- Editor -->
      <section class="flex min-w-0 flex-1 flex-col">
        <textarea
          v-model="text"
          spellcheck="true"
          placeholder="Start writing…"
          class="w-full flex-1 resize-none bg-transparent px-5 py-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
        ></textarea>
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
          <div class="mt-4 space-y-4">
            <!-- Action -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Action
              </label>
              <select
                v-model="actionId"
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
              >
                <option v-for="a in AI_ACTIONS" :key="a.id" :value="a.id">
                  {{ a.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ selectedAction?.description }}
              </p>
            </div>

            <!-- Provider -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Provider
              </label>
              <select
                v-model="providerId"
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-900"
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

            <AppButton block :disabled="!canRun" @click="runAi">
              {{ running ? 'Running…' : 'Run ' + (selectedAction?.label ?? '') }}
            </AppButton>

            <p v-if="aiError" class="text-sm font-medium text-red-600 dark:text-red-400">
              {{ aiError }}
            </p>

            <!-- Output -->
            <div>
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Result
                </label>
                <AppButton
                  v-if="output"
                  variant="bordered"
                  size="sm"
                  :disabled="running"
                  @click="applyOutput"
                >
                  Apply to draft
                </AppButton>
              </div>
              <textarea
                :value="output"
                readonly
                placeholder="AI output will appear here."
                class="mt-1 h-64 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </main>
</template>
