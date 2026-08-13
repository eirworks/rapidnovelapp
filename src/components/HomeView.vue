<script setup lang="ts">
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
      <button
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('navigate', 'quick-write')"
      >
        Quick Write
      </button>

      <button
        class="cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('navigate', 'new-project')"
      >
        New Project
      </button>

      <button
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('navigate', 'open-project')"
      >
        Open Project
      </button>

      <button
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('navigate', 'settings')"
      >
        Settings
      </button>
    </div>
  </main>
</template>
