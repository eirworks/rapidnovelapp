import type { Timeline } from "../models/Timeline";
import type { Database } from "../models/Database";

export class TimelineService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.timelines]
    }

    getById(id: string) {
        return this.database.timelines.find((t) => t.id === id)
    }

    add(timeline: Timeline) {
        this.database.timelines.push(timeline);
    }

    edit(id: string, timeline: Timeline) {
        const index = this.database.timelines.findIndex((t) => t.id === id);
        if (index !== -1) {
            this.database.timelines[index] = { ...timeline, id };
        }
    }

    delete(id: string) {
        this.database.timelines = this.database.timelines.filter((t) => t.id !== id);
    }
}
