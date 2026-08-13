<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    labelId?: string
    closeOnOverlay?: boolean
  }>(),
  { title: '', labelId: '', closeOnOverlay: true },
)

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
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
    @click.self="closeOnOverlay && emit('close')"
  >
    <div
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="labelId || (title ? 'app-modal-title' : undefined)"
      tabindex="-1"
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl outline-none"
    >
      <h2
        v-if="title"
        id="app-modal-title"
        class="text-2xl font-bold tracking-tight text-slate-900"
      >
        {{ title }}
      </h2>
      <slot />
    </div>
  </div>
</template>
