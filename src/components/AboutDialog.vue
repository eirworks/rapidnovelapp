<script setup lang="ts">
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'

defineEmits<{ close: [] }>()
</script>

<template>
  <AppModal label-id="about-title" @close="$emit('close')">
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

    <AppButton block class="mt-6" @click="$emit('close')">
      Close
    </AppButton>
  </AppModal>
</template>
