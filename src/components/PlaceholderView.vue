<script setup lang="ts">
import AppButton from './ui/AppButton.vue'

defineProps<{ title: string }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950"
  >
    <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{{ title }}</h1>
    <p class="mt-3 text-slate-500 dark:text-slate-400">This feature is not implemented yet.</p>

    <AppButton variant="bordered" class="mt-8" @click="$emit('back')">
      ← Back to Home
    </AppButton>
  </main>
</template>
