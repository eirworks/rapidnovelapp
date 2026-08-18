<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../store/projects'
import StatCard from './ui/StatCard.vue'

const projectStore = useProjectStore()

interface StatItem {
  label: string
  value: number
}

/** Builds the stat list from the store getter. */
const stats = computed<StatItem[]>(() => {
  const projectStats = projectStore.projectStats
  if (!projectStats) return []
  return [
    { label: 'Database', value: projectStats.database },
    { label: 'Contents', value: projectStats.contents },
    { label: 'Tasks', value: projectStats.tasks },
  ]
})
</script>

<template>
  <div
    v-if="stats.length"
    class="flex w-full max-w-2xl items-center justify-start gap-3"
  >
    <StatCard
      v-for="stat in stats"
      :key="stat.label"
      :label="stat.label"
      :value="stat.value"
    />
  </div>
</template>
