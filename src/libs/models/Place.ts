export class Place {
    id: string
    name: string

    // non constructor properties
    description: string = ""
    parentId: string | null = null 

    /** The universe this place belongs to, or empty when unassigned. */
    universeId: string = ''

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
} 