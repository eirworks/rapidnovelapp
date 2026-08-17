import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StatusMessage, StatusSeverity } from '../libs/models/StatusMessage'

/** Interval (ms) between successive status messages. */
const TICK_MS = 3000

/**
 * Holds a queue of status messages. Every tick the next message in the queue
 * becomes the one shown; if the queue is empty the bar is hidden.
 */
export const useStatusBarStore = defineStore('statusBar', () => {
  const queue = ref<StatusMessage[]>([])
  const current = ref<StatusMessage | null>(null)

  let timer: ReturnType<typeof setInterval> | null = null

  /** Adds a message. Shown immediately if nothing is currently displayed. */
  function enqueue(item: StatusMessage) {
    if (!current.value) {
      current.value = item
      return
    }
    queue.value.push(item)
  }

  /** Convenience helpers to enqueue a message with a given severity. */
  function success(message: string) {
    enqueue({ severity: 'success', message })
  }

  function danger(message: string) {
    enqueue({ severity: 'danger', message })
  }

  function warning(message: string) {
    enqueue({ severity: 'warning', message })
  }

  function info(message: string) {
    enqueue({ severity: 'info', message })
  }

  /**
   * Replaces the current message with the next queued one, if any.
   * When the queue is empty the bar is hidden.
   */
  function next() {
    const item = queue.value.shift()
    current.value = item ?? null
  }

  /** Hides the bar and clears any remaining queued messages. */
  function dismiss() {
    queue.value = []
    current.value = null
  }

  function start() {
    if (timer) return
    timer = setInterval(next, TICK_MS)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return {
    queue,
    current,
    enqueue,
    success,
    danger,
    warning,
    info,
    next,
    dismiss,
    start,
    stop,
  }
})
