export class Place {
    id: string
    name: string

    // non constructor properties
    description: string = ""
    parentId: string | null = null 

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }
} 