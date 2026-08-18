/**
 * A single entry in a project's timeline. Timelines are currently plain
 * named/described records; `universeId` is reserved for a future universe
 * feature and is not used yet.
 */
export class Timeline {
    id: string // UUID
    name: string

    /** Reserved for a future universe feature; unused for now. */
    universeId: string = ""

    // non constructor properties
    description: string = ""

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
}
