<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AboutDialog from './components/AboutDialog.vue'
import StatusBar from './components/StatusBar.vue'

const router = useRouter()
const aboutOpen = ref(false)

/** Navigate to a route by name. Names match the Electron menu-action ids. */
function navigate(view: string) {
  router.push({ name: view })
}

function goHome() {
  navigate('home')
}

function onMenuAction(_event: unknown, action: string) {
  if (action === 'about') {
    aboutOpen.value = true
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
