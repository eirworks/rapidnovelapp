<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../store/projects'

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
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/50 px-6 py-3 dark:bg-slate-800/50"
    >
      <span class="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {{ stat.value }}
      </span>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
        {{ stat.label }}
      </span>
    </div>
  </div>
</template>
