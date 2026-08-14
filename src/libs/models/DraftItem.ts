import type { AiAction } from './AiAction'
import { getAiAction } from './AiAction'

/**
 * Serializable shape of a single draft item, as persisted in a Quick Write
 * file and used when the renderer talks to the main process.
 */
export interface DraftItemData {
  id?: string
  /** Id of the last AI action applied, if any. */
  actionId?: string | null
  /** The current content of the item. */
  data: string
  /** Content from before the last AI action, kept for a 1-step undo. */
  recoverableData?: string | null
}

/**
 * A single editable "cell" in the Quick Write document, similar to a notebook
 * cell. It holds the current content plus everything needed to recover from
 * the last AI action in one step.
 */
export class DraftItem {
  /** Stable identifier used as the Vue `key` and for reordering. */
  id: string
  /** The AI action that produced the current content (null for manual edits). */
  action: AiAction | null
  /** The current content of the item. */
  data: string
  /** Content before the last AI action, or null when there is nothing to undo. */
  private recoverable: string | null

  constructor(data = '', action: AiAction | null = null) {
    this.id = crypto.randomUUID()
    this.action = action
    this.data = data
    this.recoverable = null
  }

  /** Whether the last AI action on this item can be undone. */
  get hasUndo(): boolean {
    return this.recoverable !== null
  }

  /** The content that a 1-step undo would restore, if any. */
  get recoverableData(): string | null {
    return this.recoverable
  }

  /**
   * Applies an AI action result, immediately replacing `data` while keeping
   * the previous content so the action can be undone.
   */
  applyAction(action: AiAction, result: string): void {
    this.action = action
    this.recoverable = this.data
    this.data = result
  }

  /**
   * Restores the content from before the last AI action. This is the single
   * undo step: after it runs, the recoverable content is cleared.
   */
  undo(): void {
    if (this.recoverable === null) return
    this.data = this.recoverable
    this.recoverable = null
    this.action = null
  }

  /** Returns the plain serializable shape of this item. */
  toJSON(): DraftItemData {
    return {
      id: this.id,
      actionId: this.action?.id ?? null,
      data: this.data,
      recoverableData: this.recoverable,
    }
  }

  /** Builds a DraftItem from its serialized shape. */
  static fromData(data: DraftItemData): DraftItem {
    const item = new DraftItem(
      data.data,
      data.actionId ? getAiAction(data.actionId) ?? null : null,
    )
    if (data.id) item.id = data.id
    item.recoverable = data.recoverableData ?? null
    return item
  }
}
