export class Place {
    id: string
    name: string

    // non constructor properties
    description: string = ""
    parentId: string | null = null 

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
} 