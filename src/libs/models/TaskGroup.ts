export class TaskGroup {
    id: string // UUID
    name: string

    // non constructor properties
    description: string | null = null
    /** Due date as an ISO date string (`YYYY-MM-DD`), or null when unset. */
    dueDate: string | null = null

    constructor(name: string) {
        this.id = crypto.randomUUID()
        this.name = name
    }
}
