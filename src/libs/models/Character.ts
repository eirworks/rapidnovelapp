export class Character {
    id: string // UUID
    firstName: string
    lastName: string
    isFemale: boolean
    birthdate: string | null | undefined = null
    aliases: string[] = []
    description: string = ''

    // Other data
    data: Map<string, string> = new Map()

    constructor(firstName: string, lastName: string, isFemale: boolean) {
        this.id = crypto.randomUUID()
        this.firstName = firstName
        this.lastName = lastName
        this.isFemale = isFemale
    }
}