import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DraftDocument } from '../libs/models/DraftDocument'

/**
 * Holds the Quick Write document so it persists when the user navigates away
 * from the Quick Write page and back.
 */
export const useQuickWriteStore = defineStore('quickWrite', () => {
  /** The notebook-style document made up of editable draft items. */
  const document = ref(new DraftDocument())
  const currentPath = ref<string | null>(null)

  function reset() {
    document.value = new DraftDocument()
    currentPath.value = null
  }

  return {
    document,
    currentPath,
    reset,
  }
})
