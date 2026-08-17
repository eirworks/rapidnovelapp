import type { Task } from "../models/Task";
import type { Database } from "../models/Database";

export class TaskService {
    constructor(private database: Database) {}

    getAll() {
        return [...this.database.tasks]
    }

    getById(id: string) {
        return this.database.tasks.find((t) => t.id === id)
    }

    add(task: Task) {
        this.database.tasks.push(task);
    }

    edit(id: string, task: Task) {
        const index = this.database.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
            this.database.tasks[index] = { ...task, id };
        }
    }

    delete(id: string) {
        this.database.tasks = this.database.tasks.filter((t) => t.id !== id);
    }
}
