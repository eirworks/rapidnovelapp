<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './ui/AppButton.vue'
import StatCard from './ui/StatCard.vue'
import { useProjectStore } from '../store/projects'

defineEmits<{ back: [] }>()

const projectStore = useProjectStore()

interface StatItem {
  label: string
  value: number
}

/** Card list of counts per database collection, sourced from the store getter. */
const cards = computed<StatItem[]>(() => {
  const stats = projectStore.databaseStats
  if (!stats) return []
  return [
    { label: 'Characters', value: stats.characters },
    { label: 'Places', value: stats.places },
    { label: 'Items', value: stats.items },
    { label: 'Groups', value: stats.groups },
    { label: 'Tasks', value: stats.tasks },
    { label: 'Task Groups', value: stats.taskGroups },
    { label: 'Plots', value: stats.plots },
    { label: 'Universes', value: stats.universes },
    { label: 'Timeline', value: stats.timeline },
  ]
})
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950"
  >
    <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
      Reports &amp; Stats
    </h1>
    <p class="mt-2 text-slate-500 dark:text-slate-400">
      Counts of everything stored in the current project.
    </p>

    <div
      class="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <StatCard
        v-for="card in cards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
      />
    </div>

    <AppButton variant="bordered" class="mt-8" @click="$emit('back')">
      ← Back to Home
    </AppButton>
  </main>
</template>
