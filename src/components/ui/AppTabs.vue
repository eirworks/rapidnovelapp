<script setup lang="ts">
defineProps<{
  tabs: { id: string; label: string }[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex gap-1 border-b border-slate-200 dark:border-slate-700">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      class="cursor-pointer rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      :class="
        modelValue === t.id
          ? 'border-indigo-600 bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-400'
          : 'border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
      "
      @click="$emit('update:modelValue', t.id)"
    >
      {{ t.label }}
    </button>
  </div>
</template>
