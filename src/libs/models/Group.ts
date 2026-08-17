/**
 * The kinds of entities a Group can gather. `Group.type` is one of these
 * strings, and it determines which members can be added to the group.
 */
export const GROUP_TYPES = ['character', 'place', 'item'] as const

export type GroupType = (typeof GROUP_TYPES)[number]

export class Group {
    id: string // UUID
    name: string
    type: GroupType

    // non constructor properties
    description: string = ""
    /** Ids of the members in this group. Their meaning depends on `type`. */
    memberIds: string[] = []

    constructor(name: string, type: GroupType) {
        this.id = crypto.randomUUID()
        this.name = name
        this.type = type
    }
}
