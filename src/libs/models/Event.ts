/**
 * A dated occurrence belonging to a timeline.
 * Actor ids refer to characters in the same project's database.
 */
export class Event {
    id: string // UUID
    name: string
    timelineId: string
    description: string = ''
    actorIds: string[] = []
    date: string

    constructor(name: string, timelineId: string, date: string) {
        this.id = crypto.randomUUID()
        this.name = name
        this.timelineId = timelineId
        this.date = date
    }
}
