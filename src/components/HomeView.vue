<script setup lang="ts">
import AppButton from './ui/AppButton.vue'

defineEmits<{ navigate: [view: string] }>()
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center"
  >
    <h1 class="text-4xl font-bold tracking-tight text-slate-900">
      Welcome to
      <span
        class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm"
      >
        RapidNovel
      </span>
    </h1>
    <p class="mt-3 text-slate-500">
      Plan, organize, and write your novel faster.
    </p>

    <div class="mt-10 flex w-72 flex-col gap-3">
      <AppButton
        variant="bordered"
        size="lg"
        @click="$emit('navigate', 'quick-write')"
      >
        Quick Write
      </AppButton>

      <AppButton
        variant="primary"
        size="lg"
        @click="$emit('navigate', 'new-project')"
      >
        New Project
      </AppButton>

      <AppButton
        variant="bordered"
        size="lg"
        @click="$emit('navigate', 'open-project')"
      >
        Open Project
      </AppButton>

      <AppButton
        variant="bordered"
        size="lg"
        @click="$emit('navigate', 'settings')"
      >
        Settings
      </AppButton>
    </div>
  </main>
</template>
