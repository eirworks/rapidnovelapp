import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Holds the Quick Write document so it persists when the user navigates away
 * from the Quick Write page and back.
 */
export const useQuickWriteStore = defineStore('quickWrite', () => {
  const text = ref('')
  const currentPath = ref<string | null>(null)

  function reset() {
    text.value = ''
    currentPath.value = null
  }

  return {
    text,
    currentPath,
    reset,
  }
})
