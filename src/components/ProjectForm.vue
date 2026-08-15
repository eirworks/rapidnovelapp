<script setup lang="ts">
import { ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppTextField from './ui/AppTextField.vue'

export interface ProjectFormPayload {
  name: string
  description: string
  author: string
}

const props = withDefaults(
  defineProps<{
    initialName?: string
    initialDescription?: string
    initialAuthor?: string
    submitLabel?: string
    cancelLabel?: string
  }>(),
  {
    initialName: '',
    initialDescription: '',
    initialAuthor: '',
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
  },
)

const emit = defineEmits<{
  save: [payload: ProjectFormPayload]
  cancel: []
}>()

const name = ref(props.initialName)
const description = ref(props.initialDescription)
const author = ref(props.initialAuthor)

function submit() {
  if (!name.value.trim()) return
  emit('save', {
    name: name.value.trim(),
    description: description.value.trim(),
    author: author.value.trim(),
  })
}
</script>

<template>
  <form class="mt-6 space-y-4" @submit.prevent="submit">
    <label
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      Name
      <AppTextField
        v-model="name"
        class="mt-1"
        placeholder="My Novel"
      />
    </label>

    <label
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      Description
      <span class="font-normal text-slate-400 dark:text-slate-500">
        (optional)
      </span>
      <AppTextField
        v-model="description"
        multiline
        :rows="3"
        class="mt-1"
        placeholder="A brief summary of your story…"
      />
    </label>

    <label
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      Author
      <span class="font-normal text-slate-400 dark:text-slate-500">
        (optional)
      </span>
      <AppTextField
        v-model="author"
        class="mt-1"
        placeholder="Your name"
      />
    </label>

    <div class="flex justify-end gap-3 pt-2">
      <AppButton variant="bordered" @click="$emit('cancel')">
        {{ cancelLabel }}
      </AppButton>
      <AppButton type="submit" :disabled="!name.trim()">
        {{ submitLabel }}
      </AppButton>
    </div>
  </form>
</template>
