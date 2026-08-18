import type { Database } from "../models/Database";
import type { Event } from "../models/Event";

/** Provides CRUD operations for events stored in a project's database. */
export class EventService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.events]
    }

    getById(id: string) {
        return this.database.events.find((event) => event.id === id)
    }

    getByTimelineId(timelineId: string) {
        return this.database.events.filter((event) => event.timelineId === timelineId)
    }

    add(event: Event) {
        this.database.events.push(event)
    }

    edit(id: string, event: Event) {
        const index = this.database.events.findIndex((current) => current.id === id)
        if (index !== -1) {
            this.database.events[index] = { ...event, id }
        }
    }

    delete(id: string) {
        this.database.events = this.database.events.filter((event) => event.id !== id)
    }
}
