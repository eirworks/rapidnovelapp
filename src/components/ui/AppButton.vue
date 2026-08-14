<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'bordered' | 'danger' | 'text'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    disabled: false,
    type: 'button',
  },
)

const variantClass: Record<string, string> = {
  primary:
    'bg-indigo-600 font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
  bordered:
    'border border-slate-300 bg-white font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  danger:
    'border border-red-200 bg-white font-medium text-red-600 shadow-sm hover:bg-red-50 focus-visible:ring-red-500 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950',
  text: 'font-semibold text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500 dark:hover:bg-indigo-950',
}

const sizeClass: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClass[variant], sizeClass[size], block && 'w-full']"
  >
    <slot />
  </button>
</template>
