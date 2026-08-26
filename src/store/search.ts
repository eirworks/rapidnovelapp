import { defineStore } from 'pinia'
import { ref } from 'vue'

/** A single search hit inside one category group. */
export interface SearchResultItem {
  /** Unique identifier of the entity. */
  id: string
  /** Display label shown to the user. */
  label: string
}

/** A named bucket of search hits (e.g. "Characters", "Tasks"). */
export interface SearchResultCategory {
  key: string
  label: string
  /** Bootstrap icon name used for the category icon. */
  icon: string
  items: SearchResultItem[]
}

/** Shared store so HomeView can pass an initial query to SearchView. */
export const useSearchStore = defineStore('search', () => {
  /** Pre-filled query passed via route params from HomeView. */
  const initialQuery = ref('')

  function setInitialQuery(query: string) {
    initialQuery.value = query
  }

  function clearInitialQuery() {
    initialQuery.value = ''
  }

  return { initialQuery, setInitialQuery, clearInitialQuery }
})
