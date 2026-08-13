<script setup lang="ts">
defineProps<{ title: string }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center"
  >
    <h1 class="text-3xl font-bold tracking-tight text-slate-900">{{ title }}</h1>
    <p class="mt-3 text-slate-500">This feature is not implemented yet.</p>

    <button
      class="mt-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      @click="$emit('back')"
    >
      ← Back to Home
    </button>
  </main>
</template>
