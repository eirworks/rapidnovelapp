<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from './store/projects'
import { useStatusBarStore } from './store/statusBar'
import AboutDialog from './components/AboutDialog.vue'
import StatusBar from './components/StatusBar.vue'

const router = useRouter()
const aboutOpen = ref(false)
const projectStore = useProjectStore()
const statusBar = useStatusBarStore()

/** Navigate to a route by name. Names match the Electron menu-action ids. */
function navigate(view: string, params?: Record<string, string>) {
  router.push({ name: view, params })
}

function goHome() {
  navigate('home')
}

/**
 * Saves the active project (if any) to
 * `~/.rapidnovel/project/<project-id>/project.json` and reports the result via
 * the status bar.
 */
async function saveProject() {
  const project = projectStore.project
  if (!project) {
    statusBar.danger('No project to save')
    return
  }
  // Snapshot the project's plain data (services are dropped — their content
  // lives in `database`).
  const snapshot = {
    id: project.id,
    name: project.name,
    description: project.description,
    author: project.author,
    database: project.database,
    content: project.content,
    contents: project.contents,
    manager: project.manager,
  }
  // Serialize to a JSON string before crossing the IPC boundary to avoid
  // structured-clone errors ("An object could not be cloned") for the project
  // graph.
  const json = JSON.stringify(snapshot, mapToObjectReplacer)
  try {
    const result = await window.projectApi?.save(json)
    statusBar.success(`Project saved to ${result.path}`)
  } catch (error) {
    statusBar.danger(`Failed to save project: ${(error as Error).message}`)
  }
}

/** Converts Maps (e.g. `Character.data`) to plain objects so they serialize. */
function mapToObjectReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value)
  }
  return value
}

function onMenuAction(_event: unknown, action: string) {
  if (action === 'about') {
    aboutOpen.value = true
    return
  }
  if (action === 'save-project') {
    void saveProject()
    return
  }
  navigate(action)
}

onMounted(() => window.ipcRenderer?.on('menu-action', onMenuAction))
onBeforeUnmount(() => window.ipcRenderer?.off('menu-action', onMenuAction))
</script>

<template>
  <router-view @navigate="navigate" @back="goHome" />

  <AboutDialog v-if="aboutOpen" @close="aboutOpen = false" />

  <StatusBar />
</template>
