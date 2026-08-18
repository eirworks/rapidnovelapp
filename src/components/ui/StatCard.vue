<script setup lang="ts">
defineProps<{
  label: string
  value: number
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/50 px-6 py-3 dark:bg-slate-800/50"
  >
    <span class="text-2xl font-semibold text-slate-900 dark:text-slate-50">
      {{ value }}
    </span>
    <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
      {{ label }}
    </span>
  </div>
</template>
