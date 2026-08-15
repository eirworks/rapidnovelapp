<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useStatusBarStore } from '../store/statusBar'
import type { StatusSeverity } from '../libs/models/StatusMessage'

const statusBar = useStatusBarStore()

/** Dot color per severity. The message text itself is not colored. */
const dotColorClass: Record<StatusSeverity, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
}

onMounted(() => statusBar.start())
onBeforeUnmount(() => statusBar.stop())
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4"
  >
    <div
      v-if="statusBar.current"
      class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <span
        v-if="statusBar.current"
        class="size-2.5 shrink-0 rounded-full"
        :class="dotColorClass[statusBar.current.severity]"
      />
      <span class="text-sm text-slate-700 dark:text-slate-200">
        {{ statusBar.current?.message }}
      </span>
    </div>
  </div>
</template>
