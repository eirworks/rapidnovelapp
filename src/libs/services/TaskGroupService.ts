import type { TaskGroup } from "../models/TaskGroup";
import type { Database } from "../models/Database";

export class TaskGroupService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.taskGroups]
    }

    getById(id: string) {
        return this.database.taskGroups.find((g) => g.id === id)
    }

    add(group: TaskGroup) {
        this.database.taskGroups.push(group);
    }

    edit(id: string, group: TaskGroup) {
        const index = this.database.taskGroups.findIndex((g) => g.id === id);
        if (index !== -1) {
            this.database.taskGroups[index] = { ...group, id };
        }
    }

    delete(id: string) {
        this.database.taskGroups = this.database.taskGroups.filter((g) => g.id !== id);
    }
}
