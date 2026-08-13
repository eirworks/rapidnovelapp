<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null
  dialogRef.value?.focus()
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  previouslyFocused?.focus()
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="close"
  >
    <div
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      tabindex="-1"
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl outline-none"
    >
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-2xl text-white shadow-sm"
      >
        ✍️
      </div>

      <h2
        id="about-title"
        class="mt-4 text-2xl font-bold tracking-tight text-slate-900"
      >
        RapidNovel
      </h2>
      <p class="mt-1 text-sm font-medium text-indigo-600">
        Plan, organize, and write your novel faster.
      </p>

      <p class="mt-4 text-sm leading-relaxed text-slate-500">
        RapidNovel helps you keep track of characters, places, items, and
        timelines while you draft your story — all in one place.
      </p>

      <button
        class="mt-6 w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="close"
      >
        Close
      </button>
    </div>
  </div>
</template>
