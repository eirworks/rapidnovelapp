<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    type?: 'text' | 'password' | 'email' | 'number'
    placeholder?: string
    disabled?: boolean
    multiline?: boolean
    rows?: number
    mono?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    multiline: false,
    rows: 4,
    mono: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const slots = useSlots()
const hasTrailing = computed(() => Boolean(slots.trailing))

const baseClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900'

const inputClass = computed(() => [
  baseClass,
  props.mono && 'font-mono',
  props.multiline && 'resize-y',
  hasTrailing.value && 'pr-16',
])

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div :class="hasTrailing ? 'relative' : ''">
    <textarea
      v-if="multiline"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      @input="onInput"
    ></textarea>
    <input
      v-else
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      @input="onInput"
    />
    <div
      v-if="hasTrailing"
      class="absolute inset-y-0 right-0 flex items-center pr-1"
    >
      <slot name="trailing" />
    </div>
  </div>
</template>
