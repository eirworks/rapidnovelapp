<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

type Theme = 'auto' | 'dark' | 'light'
type SettingsTab = 'app' | 'ai'

defineEmits<{ back: [] }>()

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'app', label: 'App' },
  { id: 'ai', label: 'AI' },
]

const themes: { value: Theme; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto', description: 'Follow the system preference' },
  { value: 'dark', label: 'Dark', description: 'Always use the dark theme' },
  { value: 'light', label: 'Light', description: 'Always use the light theme' },
]

// ---------------- App tab ----------------
const loading = ref(true)
const theme = ref<Theme>('auto')
const quickWriteDir = ref('')
const saving = ref(false)
const saved = ref(false)
const error = ref('')

// ---------------- AI tab ----------------
const aiLoading = ref(true)
const aiError = ref('')
const providers = ref<AiProvider[]>([])
const selectedId = ref<string | null>(null)
const showApiKey = ref(false)
const formSaving = ref(false)
const formError = ref('')
const form = reactive({
  isNew: true,
  name: '',
  baseUrl: '',
  apiKey: '',
  modelsText: '',
})

const tab = ref<SettingsTab>('app')

onMounted(async () => {
  // App tab
  try {
    const config = await window.configApi.get()
    theme.value = config.theme
    quickWriteDir.value = config.lastQuickWriteDir
  } catch {
    error.value = 'Could not load settings.'
  } finally {
    loading.value = false
  }

  // AI tab
  try {
    const config = await window.configApi.get()
    providers.value = config.aiProviders
    if (providers.value.length > 0) selectProvider(providers.value[0].id)
  } catch {
    aiError.value = 'Could not load AI providers.'
  } finally {
    aiLoading.value = false
  }
})

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await window.configApi.update({ theme: theme.value })
    saved.value = true
  } catch {
    error.value = 'Could not save settings.'
  } finally {
    saving.value = false
  }
}

// ---------------- AI provider actions ----------------
function selectProvider(id: string) {
  const provider = providers.value.find((p) => p.id === id)
  if (!provider) return
  selectedId.value = id
  form.isNew = false
  form.name = provider.name
  form.baseUrl = provider.baseUrl
  form.apiKey = provider.apiKey
  form.modelsText = provider.models.join('\n')
  formError.value = ''
}

function startNewProvider() {
  selectedId.value = null
  form.isNew = true
  form.name = ''
  form.baseUrl = ''
  form.apiKey = ''
  form.modelsText = ''
  formError.value = ''
}

function cancelEdit() {
  formError.value = ''
  if (selectedId.value) {
    selectProvider(selectedId.value)
  } else {
    form.isNew = false
    form.name = ''
    form.baseUrl = ''
    form.apiKey = ''
    form.modelsText = ''
  }
}

async function saveProvider() {
  formError.value = ''
  const name = form.name.trim()
  const baseUrl = form.baseUrl.trim()
  if (!name) {
    formError.value = 'Name is required.'
    return
  }
  if (!baseUrl) {
    formError.value = 'Base URL is required.'
    return
  }
  const models = form.modelsText
    .split(/[\n,]+/)
    .map((m) => m.trim())
    .filter(Boolean)

  formSaving.value = true
  try {
    if (form.isNew) {
      const created = await window.configApi.addAiProvider({
        name,
        baseUrl,
        apiKey: form.apiKey,
        models,
      })
      providers.value = [...providers.value, created]
      selectProvider(created.id)
    } else if (selectedId.value) {
      const updated = await window.configApi.updateAiProvider({
        id: selectedId.value,
        name,
        baseUrl,
        apiKey: form.apiKey,
        models,
      })
      providers.value = providers.value.map((p) =>
        p.id === updated.id ? updated : p,
      )
      selectProvider(updated.id)
    }
  } catch (e) {
    formError.value =
      e instanceof Error ? e.message : 'Could not save provider.'
  } finally {
    formSaving.value = false
  }
}

async function deleteProvider() {
  if (!selectedId.value) return
  const provider = providers.value.find((p) => p.id === selectedId.value)
  if (!provider) return
  if (!window.confirm(`Delete provider “${provider.name}”?`)) return
  try {
    await window.configApi.deleteAiProvider(selectedId.value)
    providers.value = providers.value.filter((p) => p.id !== selectedId.value)
    selectedId.value = null
    cancelEdit()
  } catch (e) {
    formError.value =
      e instanceof Error ? e.message : 'Could not delete provider.'
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <button
          class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="$emit('back')"
        >
          ← Back
        </button>
      </div>

      <!-- Tabs -->
      <div class="mt-6 flex gap-1 border-b border-slate-200">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="cursor-pointer rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="
            tab === t.id
              ? 'border-indigo-600 bg-white text-indigo-700'
              : 'border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-700'
          "
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- ================= App tab ================= -->
      <div v-if="tab === 'app'" class="mt-8 space-y-8">
        <p v-if="loading" class="text-slate-500">Loading settings…</p>

        <template v-else>
          <!-- Editable: non-hidden settings -->
          <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Appearance</h2>
            <p class="mt-1 text-sm text-slate-500">Theme is not applied yet.</p>

            <div class="mt-4 grid grid-cols-3 gap-3">
              <button
                v-for="t in themes"
                :key="t.value"
                class="cursor-pointer rounded-lg border px-3 py-3 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                :class="
                  theme === t.value
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                "
                @click="theme = t.value"
              >
                <span
                  class="block font-semibold"
                  :class="theme === t.value ? 'text-indigo-700' : 'text-slate-800'"
                >
                  {{ t.label }}
                </span>
                <span class="mt-1 block text-xs text-slate-500">
                  {{ t.description }}
                </span>
              </button>
            </div>
          </section>

          <!-- Hidden: shown read-only, not editable -->
          <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Storage</h2>
            <p class="mt-1 text-sm text-slate-500">
              Managed by the app. Displayed for reference only.
            </p>

            <dl class="mt-4 space-y-3">
              <div>
                <dt class="text-sm font-medium text-slate-700">
                  Last Quick Write directory
                </dt>
                <dd
                  class="mt-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-500"
                  :title="quickWriteDir"
                >
                  {{ quickWriteDir || 'Not set yet' }}
                </dd>
              </div>
            </dl>
          </section>

          <div v-if="saved" class="text-sm font-medium text-emerald-600">
            ✓ Settings saved
          </div>
          <p v-if="error" class="text-sm font-medium text-red-600">{{ error }}</p>

          <button
            class="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Saving…' : 'Save Settings' }}
          </button>
        </template>
      </div>

      <!-- ================= AI tab ================= -->
      <div v-else class="mt-8">
        <p v-if="aiLoading" class="text-slate-500">Loading AI providers…</p>

        <div v-else class="flex items-start gap-6">
          <!-- Provider sidebar -->
          <aside class="w-64 shrink-0">
            <div
              class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <ul
                v-if="providers.length > 0"
                class="max-h-96 overflow-y-auto"
              >
                <li v-for="p in providers" :key="p.id">
                  <button
                    class="w-full border-l-2 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                    :class="
                      selectedId === p.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-transparent hover:bg-slate-50'
                    "
                    @click="selectProvider(p.id)"
                  >
                    <span
                      class="block truncate text-sm font-semibold"
                      :class="
                        selectedId === p.id ? 'text-indigo-700' : 'text-slate-800'
                      "
                    >
                      {{ p.name }}
                    </span>
                    <span
                      class="mt-0.5 block truncate font-mono text-xs text-slate-500"
                      :title="p.baseUrl"
                    >
                      {{ p.baseUrl || 'No base URL' }}
                    </span>
                  </button>
                </li>
              </ul>
              <p v-else class="px-4 py-8 text-center text-sm text-slate-500">
                No providers yet.
              </p>

              <button
                class="cursor-pointer border-t border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                @click="startNewProvider"
              >
                + Add Provider
              </button>
            </div>
          </aside>

          <!-- Provider form -->
          <section class="min-w-0 flex-1">
            <div
              class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 class="text-lg font-semibold text-slate-900">
                {{ form.isNew ? 'New Provider' : 'Edit Provider' }}
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                {{
                  form.isNew
                    ? 'Fill in the details, then save to add it.'
                    : 'Update the details, then save to apply changes.'
                }}
              </p>

              <div class="mt-5 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="e.g. OpenRouter"
                    class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700">
                    Base URL
                  </label>
                  <input
                    v-model="form.baseUrl"
                    type="text"
                    placeholder="https://api.example.com/v1"
                    class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700">
                    API Key
                  </label>
                  <div class="relative mt-1">
                    <input
                      v-model="form.apiKey"
                      :type="showApiKey ? 'text' : 'password'"
                      placeholder="sk-…"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-16 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 cursor-pointer rounded-r-lg px-3 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      @click="showApiKey = !showApiKey"
                    >
                      {{ showApiKey ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700">
                    Models
                  </label>
                  <textarea
                    v-model="form.modelsText"
                    rows="4"
                    placeholder="gpt-4o&#10;claude-3.5-sonnet"
                    class="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  ></textarea>
                  <p class="mt-1 text-xs text-slate-500">
                    One model per line (or comma-separated).
                  </p>
                </div>

                <p v-if="formError" class="text-sm font-medium text-red-600">
                  {{ formError }}
                </p>

                <div class="flex items-center gap-3 pt-1">
                  <button
                    class="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                    :disabled="formSaving"
                    @click="saveProvider"
                  >
                    {{ formSaving ? 'Saving…' : 'Save Provider' }}
                  </button>
                  <button
                    class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="!form.isNew && selectedId"
                    class="ml-auto cursor-pointer rounded-lg border border-red-200 bg-white px-4 py-2 font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    @click="deleteProvider"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <p v-if="aiError" class="mt-4 text-sm font-medium text-red-600">
          {{ aiError }}
        </p>
      </div>
    </div>
  </main>
</template>
