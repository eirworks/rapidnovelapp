import { DraftItem } from './DraftItem'
import type { DraftItemData } from './DraftItem'

/**
 * Serializable shape of the whole Quick Write / Draft document, as persisted
 * to disk (Quick Write files and `drafts/<id>.json`).
 */
export interface DraftDocumentData {
  /** Format version so future migrations can be handled. */
  version: 1
  /** Stable identifier; also the file name (`<id>.json`) in the drafts dir. */
  id?: string
  /** Working title of the draft. */
  title?: string
  /** Id of the story this draft belongs to, or null when unassigned. */
  storyId?: string | null
  items: DraftItemData[]
}

/**
 * The Quick Write / Draft document: an ordered array of editable draft items
 * (like a notebook). Owns the collection-level operations: adding, removing,
 * and reordering items, plus serialization to/from the saved file.
 */
export class DraftDocument {
  /** Stable identifier, also used as the saved file name (`<id>.json`). */
  id: string = crypto.randomUUID()

  /** Working title of the draft. */
  title: string = ''

  /** Id of the story this draft belongs to, or null when unassigned. */
  storyId: string | null = null

  items: DraftItem[] = []

  /**
   * Adds a new empty item. When `index` is omitted it is appended at the end;
   * otherwise it is inserted at that position (clamped).
   */
  addItem(data = '', index?: number): DraftItem {
    const item = new DraftItem(data)
    if (index === undefined || index >= this.items.length) {
      this.items.push(item)
    } else {
      this.items.splice(Math.max(0, index), 0, item)
    }
    return item
  }

  /** Removes the item with the given id (no-op if not found). */
  removeItem(id: string): void {
    const index = this.items.findIndex((item) => item.id === id)
    if (index !== -1) this.items.splice(index, 1)
  }

  /** Returns the item with the given id, or undefined. */
  getItem(id: string): DraftItem | undefined {
    return this.items.find((item) => item.id === id)
  }

  /**
   * Reorders the document so the item identified by `sourceId` ends up at the
   * position of the item identified by `targetId`. Used for drag-to-reorder.
   */
  moveItem(sourceId: string, targetId: string): void {
    const from = this.items.findIndex((item) => item.id === sourceId)
    const to = this.items.findIndex((item) => item.id === targetId)
    if (from === -1 || to === -1 || from === to) return
    const [moved] = this.items.splice(from, 1)
    this.items.splice(to, 0, moved)
  }

  /** Removes every item. */
  clear(): void {
    this.items = []
  }

  /** Returns the plain serializable shape of the document. */
  toJSON(): DraftDocumentData {
    return {
      version: 1,
      id: this.id,
      title: this.title,
      storyId: this.storyId,
      items: this.items.map((item) => item.toJSON()),
    }
  }

  /**
   * Builds a DraftDocument from a parsed JSON payload. Unknown shapes safely
   * produce an empty document.
   */
  static fromJSON(data: unknown): DraftDocument {
    const doc = new DraftDocument()
    const raw = (data && typeof data === 'object' ? data : {}) as Record<
      string,
      unknown
    >
    if (typeof raw.id === 'string' && raw.id.length > 0) doc.id = raw.id
    if (typeof raw.title === 'string') doc.title = raw.title
    if (typeof raw.storyId === 'string' && raw.storyId.length > 0) {
      doc.storyId = raw.storyId
    }
    if (Array.isArray(raw.items)) {
      doc.items = raw.items
        .filter((item): item is DraftItemData => !!item && typeof item === 'object')
        .map((item) => DraftItem.fromData(item))
    }
    return doc
  }
}
