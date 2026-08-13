<script setup lang="ts">
defineProps<{
  tabs: { id: string; label: string }[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex gap-1 border-b border-slate-200">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      class="cursor-pointer rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      :class="
        modelValue === t.id
          ? 'border-indigo-600 bg-white text-indigo-700'
          : 'border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-700'
      "
      @click="$emit('update:modelValue', t.id)"
    >
      {{ t.label }}
    </button>
  </div>
</template>
