<script setup lang="ts">
interface Crumb {
  /** Label shown for this breadcrumb segment. */
  label: string
  /** Optional click handler; when omitted the crumb renders as the current page. */
  onClick?: () => void
}

defineProps<{ crumbs: Crumb[] }>()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
    <template v-for="(crumb, index) in crumbs" :key="index">
      <button
        v-if="crumb.onClick"
        type="button"
        class="cursor-pointer font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        @click="crumb.onClick"
      >
        {{ crumb.label }}
      </button>
      <span
        v-else
        class="font-semibold text-slate-900 dark:text-slate-50"
        aria-current="page"
      >
        {{ crumb.label }}
      </span>
      <span
        v-if="index < crumbs.length - 1"
        class="text-slate-400 dark:text-slate-500"
      >
        /
      </span>
    </template>
  </nav>
</template>
