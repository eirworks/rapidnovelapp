/**
 * A single entry in a project's timeline. `universeId` links the timeline to
 * the Universe it belongs to, or is empty when the timeline is unassigned.
 */
export class Timeline {
    id: string // UUID
    name: string

    /** The universe this timeline belongs to, or empty when unassigned. */
    universeId: string = ""

    // non constructor properties
    description: string = ""

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
}
