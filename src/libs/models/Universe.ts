/**
 * A self-contained world or setting within a story project. Universes can host
 * timelines, characters, places, and other narrative elements — though
 * cross-referencing is left to future features. Currently stores only identity
 * fields.
 */
export class Universe {
    id: string // UUID formatted
    name: string
    description: string = ""

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
}
