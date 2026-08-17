/**
 * The supported item categories. `Item.type` is one of these strings.
 * Extend this list (and the `ItemType` union) to add new categories.
 */
export const ITEM_TYPES = [
  'Weapon',
  'Consumable',
  'Artifact',
  'Equipment',
  'Tool',
  'Key',
  'Document',
  'Other',
] as const

export type ItemType = (typeof ITEM_TYPES)[number]

export class Item {
    id: string // UUID
    name: string
    type: ItemType

    // non constructor properties
    description: string = ""
    /** The id of the owning character, or null when the item has no owner. */
    ownerId: string | null = null

    constructor(name: string, type: ItemType) {
        this.id = crypto.randomUUID()
        this.name = name
        this.type = type
    }
}
